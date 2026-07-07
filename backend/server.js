require('dotenv').config();
'use strict';

const express      = require('express');
const initSqlJs    = require('sql.js');
const fs           = require('fs');
const path         = require('path');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET manquant dans .env');
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, 'data');
const PORT = 8080;

// Converts YYMMDD → YYYY-MM-DD. Returns null if the format is invalid.
function parseYYMMDD(yymmdd) {
  if (typeof yymmdd !== 'string' || !/^\d{6}$/.test(yymmdd)) return null;
  const yy = yymmdd.slice(0, 2);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const month = parseInt(mm, 10);
  const day   = parseInt(dd, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `20${yy}-${mm}-${dd}`;
}

// Parses CSV content into an array of objects (comma-separated, first row = headers).
function parseCsv(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] ?? '').trim();
    });
    return obj;
  });
}

const app = express();
let db;

app.use(express.json());

// Middleware — Checks for the presence and validity of a JWT Bearer token
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Jeton manquant ou invalide.' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch (_err) {
    return res.status(401).json({ erreur: 'Jeton manquant ou invalide.' });
  }
}

// GET /gti525/v1/ — API discovery endpoint
app.get('/gti525/v1/', (_req, res) => {
  res.json({
    api: 'GTI525 — MTL Vélo',
    version: 'v1',
    endpoints: [
      { methode: 'GET',    chemin: '/gti525/v1/',                       description: 'Liste tous les points de terminaison disponibles' },
      { methode: 'POST',   chemin: '/gti525/v1/auth/inscription',       description: 'Crée un compte utilisateur', corps: { courriel: 'string', motDePasse: 'string' } },
      { methode: 'POST',   chemin: '/gti525/v1/auth/connexion',         description: 'Authentifie et retourne un JWT valide 24h', corps: { courriel: 'string', motDePasse: 'string' } },
      { methode: 'GET',    chemin: '/gti525/v1/compteurs',              description: 'Liste tous les compteurs de vélo', parametres: { statut: 'filtre (ex. Actif)', limit: 'entier', offset: 'entier' } },
      { methode: 'GET',    chemin: '/gti525/v1/compteurs/:id/passages', description: 'Passages journaliers agrégés pour un compteur', parametres: { debut: 'YYMMDD', fin: 'YYMMDD' } },
      { methode: 'GET',    chemin: '/gti525/v1/pistes',                 description: 'Réseau cyclable (GeoJSON FeatureCollection)', parametres: { arrondissement: 'filtre par nom', saisons4: 'Oui|Non' } },
      { methode: 'GET',    chemin: '/gti525/v1/territoires',            description: 'Limites des arrondissements (GeoJSON FeatureCollection)' },
      { methode: 'GET',    chemin: '/gti525/v1/pointsdinteret',         description: 'Points d\'intérêt cyclables', parametres: { arrondissement: 'filtre par nom', limit: 'entier', offset: 'entier' } },
      { methode: 'POST',   chemin: '/gti525/v1/pointsdinteret',         description: 'Ajouter un point d\'intérêt (authentification requise)' },
      { methode: 'PUT',    chemin: '/gti525/v1/pointsdinteret/:id',     description: 'Modifier un point d\'intérêt (authentification requise)' },
      { methode: 'DELETE', chemin: '/gti525/v1/pointsdinteret/:id',     description: 'Supprimer un point d\'intérêt (authentification requise)' },
    ],
  });
});

// POST /gti525/v1/auth/inscription — Creates a new user account
app.post('/gti525/v1/auth/inscription', async (req, res) => {
  const { courriel, motDePasse } = req.body ?? {};
  if (!courriel || !motDePasse) {
    return res.status(400).json({ erreur: 'Courriel et mot de passe requis.' });
  }
  try {
    const mdpHash = await bcrypt.hash(motDePasse, 10);
    const stmt = db.prepare('INSERT INTO utilisateurs (courriel, mdp_hash) VALUES (?, ?)');
    stmt.bind([courriel, mdpHash]);
    stmt.step();
    stmt.free();
    return res.status(201).json({ message: 'Compte créé.' });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ erreur: 'Ce courriel est déjà utilisé.' });
    }
    return res.status(500).json({ erreur: 'Erreur serveur.' });
  }
});

// POST /gti525/v1/auth/connexion — Authenticates a user and returns a JWT
app.post('/gti525/v1/auth/connexion', async (req, res) => {
  const { courriel, motDePasse } = req.body ?? {};
  if (!courriel || !motDePasse) {
    return res.status(400).json({ erreur: 'Courriel et mot de passe requis.' });
  }
  try {
    const stmt = db.prepare('SELECT id, mdp_hash FROM utilisateurs WHERE courriel = ?');
    stmt.bind([courriel]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (!row || !(await bcrypt.compare(motDePasse, row.mdp_hash))) {
      return res.status(401).json({ erreur: 'Identifiants invalides.' });
    }

    const jeton = jwt.sign(
      { sub: row.id, courriel },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.status(200).json({ jeton });
  } catch (_err) {
    return res.status(500).json({ erreur: 'Erreur serveur.' });
  }
});

// GET /gti525/v1/compteurs — bike counters with optional filtering and pagination
app.get('/gti525/v1/compteurs', (req, res) => {
  const { statut, limit, offset } = req.query;
  try {
    const conditions = [];
    const params     = [];

    if (statut) { conditions.push('statut = ?'); params.push(statut); }

    let sql = `SELECT id AS ID, nom AS Nom, statut AS Statut,
                      latitude AS Latitude, longitude AS Longitude,
                      annee_implante AS Annee_implante
               FROM compteurs`;
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY id';
    if (limit)  { sql += ' LIMIT ?';  params.push(parseInt(limit,  10)); }
    if (offset) { sql += ' OFFSET ?'; params.push(parseInt(offset, 10)); }

    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json(rows);
  } catch (_err) {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/compteurs/:id/passages?debut=YYMMDD&fin=YYMMDD — daily aggregated passage counts for a counter
app.get('/gti525/v1/compteurs/:id/passages', (req, res) => {
  const { id } = req.params;
  const { debut, fin } = req.query;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ erreur: 'Invalid counter identifier.' });
  }

  let debutIso = null;
  let finIso   = null;

  if (debut !== undefined || fin !== undefined) {
    if (!debut || !fin) {
      return res.status(400).json({ erreur: 'Parameters debut and fin must be provided together (format YYMMDD).' });
    }
    debutIso = parseYYMMDD(debut);
    finIso   = parseYYMMDD(fin);
    if (!debutIso || !finIso) {
      return res.status(400).json({ erreur: 'Invalid date format. Use YYMMDD (e.g. 220101).' });
    }
    if (debutIso > finIso) {
      return res.status(400).json({ erreur: 'Start date must be before or equal to end date.' });
    }
  }

  try {
    let sql;
    let params;

    if (debutIso && finIso) {
      sql = `SELECT date(date_heure) AS jour, SUM(nb_passages) AS total_passages
             FROM comptage_velo
             WHERE id_compteur = ? AND date(date_heure) BETWEEN ? AND ?
             GROUP BY date(date_heure)
             ORDER BY jour`;
      params = [parseInt(id, 10), debutIso, finIso];
    } else {
      sql = `SELECT date(date_heure) AS jour, SUM(nb_passages) AS total_passages
             FROM comptage_velo
             WHERE id_compteur = ?
             GROUP BY date(date_heure)
             ORDER BY jour`;
      params = [parseInt(id, 10)];
    }

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();

    if (rows.length === 0) {
      return res.status(404).json({ erreur: 'No data found for this counter in the requested period.' });
    }

    res.json(rows);
  } catch (_err) {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/pistes — bike network (GeoJSON) with optional filtering
app.get('/gti525/v1/pistes', (req, res) => {
  const { arrondissement, saisons4 } = req.query;
  try {
    const conditions = [];
    const params     = [];

    if (arrondissement) { conditions.push('nom_arr_ville_desc = ?'); params.push(arrondissement); }
    if (saisons4)       { conditions.push('saisons4 = ?');           params.push(saisons4); }

    let sql = 'SELECT feature FROM pistes';
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const features = [];
    while (stmt.step()) features.push(JSON.parse(stmt.getAsObject().feature));
    stmt.free();

    res.setHeader('Content-Type', 'application/geo+json');
    res.json({ type: 'FeatureCollection', features });
  } catch (_err) {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/territoires — borough boundaries (GeoJSON)
app.get('/gti525/v1/territoires', (_req, res) => {
  try {
    const stmt = db.prepare('SELECT feature FROM territoires');
    const features = [];
    while (stmt.step()) features.push(JSON.parse(stmt.getAsObject().feature));
    stmt.free();

    res.setHeader('Content-Type', 'application/geo+json');
    res.json({ type: 'FeatureCollection', features });
  } catch (_err) {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/pointsdinteret — points of interest with optional filtering and pagination
app.get('/gti525/v1/pointsdinteret', (req, res) => {
  const { arrondissement, limit, offset } = req.query;
  try {
    const conditions = [];
    const params     = [];

    if (arrondissement) { conditions.push('arrondissement = ?'); params.push(arrondissement); }

    let sql = `SELECT id AS ID, arrondissement AS Arrondissement,
                      nom_parc_lieu AS Nom_parc_lieu,
                      proximite_jeux_repere AS "Proximité_jeux_repère",
                      intersection AS Intersection, etat AS Etat,
                      date_installation AS Date_installation, remarque AS Remarque,
                      precision_localisation AS Precision_localisation,
                      x AS X, y AS Y, longitude AS Longitude, latitude AS Latitude
               FROM pointsdinteret`;
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY id';
    if (limit)  { sql += ' LIMIT ?';  params.push(parseInt(limit,  10)); }
    if (offset) { sql += ' OFFSET ?'; params.push(parseInt(offset, 10)); }

    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json(rows);
  } catch (_err) {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// POST /PUT /DELETE /gti525/v1/pointsdinteret — protected mutations (not yet implemented)
app.post('/gti525/v1/pointsdinteret', requireAuth, (_req, res) => {
  res.status(501).json({ erreur: 'Non implémenté.' });
});

app.put('/gti525/v1/pointsdinteret/:id', requireAuth, (_req, res) => {
  res.status(501).json({ erreur: 'Non implémenté.' });
});

app.delete('/gti525/v1/pointsdinteret/:id', requireAuth, (_req, res) => {
  res.status(501).json({ erreur: 'Non implémenté.' });
});

// Generic 404 handler
app.use((_req, res) => {
  res.status(404).json({ erreur: 'Route not found.' });
});

module.exports = { app, setDb: (database) => { db = database; } };

if (require.main === module) {
  initSqlJs().then(SQL => {
    const fileBuffer = fs.readFileSync(path.join(DATA_DIR, 'comptage_velo.db'));
    db = new SQL.Database(fileBuffer);

    // user table
    db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      courriel TEXT    NOT NULL UNIQUE,
      mdp_hash TEXT    NOT NULL,
      cree_le  TEXT    NOT NULL DEFAULT (datetime('now'))
    )`);

    // compteurs table — loaded from compteurs.csv
    db.run(`CREATE TABLE IF NOT EXISTS compteurs (
      id             TEXT NOT NULL PRIMARY KEY,
      nom            TEXT,
      statut         TEXT,
      latitude       REAL,
      longitude      REAL,
      annee_implante INTEGER
    )`);
    db.run('BEGIN TRANSACTION');
    const compteurRows = parseCsv(fs.readFileSync(path.join(DATA_DIR, 'compteurs.csv'), 'utf8'));
    const stmtC = db.prepare('INSERT OR IGNORE INTO compteurs VALUES (?,?,?,?,?,?)');
    for (const r of compteurRows) {
      stmtC.bind([r.ID, r.Nom, r.Statut, parseFloat(r.Latitude), parseFloat(r.Longitude), parseInt(r.Annee_implante, 10)]);
      stmtC.step();
      stmtC.reset();
    }
    stmtC.free();
    db.run('COMMIT');

    // pointsdinteret table — loaded from poi.csv
    db.run(`CREATE TABLE IF NOT EXISTS pointsdinteret (
      id                     INTEGER PRIMARY KEY,
      arrondissement         TEXT,
      nom_parc_lieu          TEXT,
      proximite_jeux_repere  TEXT,
      intersection           TEXT,
      etat                   TEXT,
      date_installation      TEXT,
      remarque               TEXT,
      precision_localisation TEXT,
      x REAL, y REAL, longitude REAL, latitude REAL
    )`);
    db.run('BEGIN TRANSACTION');
    const poiRows = parseCsv(fs.readFileSync(path.join(DATA_DIR, 'poi.csv'), 'utf8'));
    const stmtP = db.prepare('INSERT OR IGNORE INTO pointsdinteret VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    for (const r of poiRows) {
      stmtP.bind([
        parseInt(r.ID, 10), r.Arrondissement, r.Nom_parc_lieu,
        r['Proximité_jeux_repère'], r.Intersection, r.Etat,
        r.Date_installation, r.Remarque, r.Precision_localisation,
        parseFloat(r.X), parseFloat(r.Y), parseFloat(r.Longitude), parseFloat(r.Latitude),
      ]);
      stmtP.step();
      stmtP.reset();
    }
    stmtP.free();
    db.run('COMMIT');

    // pistes table — loaded from reseau_cyclable.geojson
    db.run(`CREATE TABLE IF NOT EXISTS pistes (
      id_cycl             INTEGER PRIMARY KEY,
      feature             TEXT NOT NULL,
      nom_arr_ville_desc  TEXT,
      avancement_code     TEXT,
      type_voie_code      TEXT,
      rev_avancement_code TEXT,
      saisons4            TEXT
    )`);
    db.run('BEGIN TRANSACTION');
    const pistesGeoJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'reseau_cyclable.geojson'), 'utf8'));
    const stmtF = db.prepare('INSERT OR IGNORE INTO pistes VALUES (?,?,?,?,?,?,?)');
    for (const feature of pistesGeoJson.features) {
      const p = feature.properties;
      stmtF.bind([
        p.ID_CYCL, JSON.stringify(feature),
        p.NOM_ARR_VILLE_DESC ?? null,
        p.AVANCEMENT_CODE    ?? null,
        p.TYPE_VOIE_CODE     ?? null,
        p.REV_AVANCEMENT_CODE ?? null,
        p.SAISONS4           ?? null,
      ]);
      stmtF.step();
      stmtF.reset();
    }
    stmtF.free();
    db.run('COMMIT');

    // territoires table — loaded from territoires.geojson
    db.run(`CREATE TABLE IF NOT EXISTS territoires (
      nom     TEXT NOT NULL PRIMARY KEY,
      feature TEXT NOT NULL
    )`);
    db.run('BEGIN TRANSACTION');
    const territoiresGeoJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'territoires.geojson'), 'utf8'));
    const stmtT = db.prepare('INSERT OR IGNORE INTO territoires VALUES (?,?)');
    for (const feature of territoiresGeoJson.features) {
      stmtT.bind([feature.properties.NOM, JSON.stringify(feature)]);
      stmtT.step();
      stmtT.reset();
    }
    stmtT.free();
    db.run('COMMIT');

    app.listen(PORT, () => {
      console.log(`Serveur GTI525 démarré sur http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to load the database:', err.message);
    process.exit(1);
  });
}
