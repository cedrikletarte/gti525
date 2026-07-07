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

// Validates YYYY-MM-DD. Returns the string on success, null otherwise.
function parseISODate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const parts = str.split('-');
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return str;
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
  } catch {
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
      { methode: 'GET',    chemin: '/gti525/v1/compteurs',              description: 'Liste paginée des compteurs', parametres: { nom: 'recherche textuelle', statut: 'filtre exact', arrondissement: 'filtre exact', implantation: 'année minimale', limite: 'entier (déf. 20)', page: 'entier (déf. 1)' } },
      { methode: 'GET',    chemin: '/gti525/v1/compteurs/:id',          description: 'Informations d\'un compteur (sans passages)' },
      { methode: 'GET',    chemin: '/gti525/v1/compteurs/:id/passages', description: 'Passages agrégés pour un compteur', parametres: { debut: 'YYYY-MM-DD', fin: 'YYYY-MM-DD', intervalle: 'jour|semaine|mois (déf. jour)' } },
      { methode: 'GET',    chemin: '/gti525/v1/pistes',                 description: 'Réseau cyclable (GeoJSON FeatureCollection)', parametres: { arrondissement: 'filtre par nom', saisons4: 'Oui|Non' } },
      { methode: 'GET',    chemin: '/gti525/v1/territoires',            description: 'Limites des arrondissements (GeoJSON FeatureCollection)' },
      { methode: 'GET',    chemin: '/gti525/v1/pointsdinteret',         description: 'Liste paginée des points d\'intérêt', parametres: { nom: 'recherche textuelle', type: 'filtre exact', arrondissement: 'filtre exact', limite: 'entier (déf. 20)', page: 'entier (déf. 1)' } },
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
  } catch {
    return res.status(500).json({ erreur: 'Erreur serveur.' });
  }
});

// GET /gti525/v1/compteurs — paginated list with optional filters
app.get('/gti525/v1/compteurs', (req, res) => {
  const { nom, statut, arrondissement, implantation } = req.query;
  const limite = Math.max(1, parseInt(req.query.limite, 10) || 20);
  const page   = Math.max(1, parseInt(req.query.page,   10) || 1);
  const offset = (page - 1) * limite;

  try {
    const conditions = [];
    const params     = [];

    if (nom)            { conditions.push("nom LIKE ?");          params.push(`%${nom}%`); }
    if (statut)         { conditions.push('statut = ?');           params.push(statut); }
    if (arrondissement) { conditions.push('arrondissement = ?');   params.push(arrondissement); }
    if (implantation)   { conditions.push('annee_implante >= ?');  params.push(parseInt(implantation, 10)); }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const stmtCount = db.prepare(`SELECT COUNT(*) AS n FROM compteurs${where}`);
    if (params.length) stmtCount.bind(params);
    const total = stmtCount.step() ? (stmtCount.getAsObject().n ?? 0) : 0;
    stmtCount.free();

    const stmtData = db.prepare(
      `SELECT id AS ID, nom AS Nom, statut AS Statut,
              latitude AS Latitude, longitude AS Longitude,
              annee_implante AS Annee_implante, arrondissement AS Arrondissement
       FROM compteurs${where} ORDER BY id LIMIT ? OFFSET ?`
    );
    stmtData.bind([...params, limite, offset]);
    const donnees = [];
    while (stmtData.step()) donnees.push(stmtData.getAsObject());
    stmtData.free();

    res.json({ donnees, total, page, limite });
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/compteurs/:id — single counter info (no passages)
app.get('/gti525/v1/compteurs/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare(
      `SELECT id AS ID, nom AS Nom, statut AS Statut,
              latitude AS Latitude, longitude AS Longitude,
              annee_implante AS Annee_implante, arrondissement AS Arrondissement
       FROM compteurs WHERE id = ?`
    );
    stmt.bind([id]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    if (!row) return res.status(404).json({ erreur: 'Compteur introuvable.' });
    res.json(row);
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/compteurs/:id/passages — daily/weekly/monthly aggregated passage counts
app.get('/gti525/v1/compteurs/:id/passages', (req, res) => {
  const { id } = req.params;
  const { debut, fin, intervalle = 'jour' } = req.query;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ erreur: 'Invalid counter identifier.' });
  }

  const INTERVALLES = {
    jour:    { select: "date(date_heure) AS jour",                 group: "date(date_heure)" },
    semaine: { select: "strftime('%Y-%W', date_heure) AS semaine", group: "strftime('%Y-%W', date_heure)" },
    mois:    { select: "strftime('%Y-%m', date_heure) AS mois",    group: "strftime('%Y-%m', date_heure)" },
  };

  if (!INTERVALLES[intervalle]) {
    return res.status(400).json({ erreur: "Intervalle invalide. Valeurs acceptées : jour, semaine, mois." });
  }

  let debutIso = null;
  let finIso   = null;

  if (debut !== undefined || fin !== undefined) {
    if (!debut || !fin) {
      return res.status(400).json({ erreur: 'Les paramètres debut et fin doivent être fournis ensemble (format YYYY-MM-DD).' });
    }
    debutIso = parseISODate(debut);
    finIso   = parseISODate(fin);
    if (!debutIso || !finIso) {
      return res.status(400).json({ erreur: 'Format de date invalide. Utilisez YYYY-MM-DD (ex. 2022-01-01).' });
    }
    if (debutIso > finIso) {
      return res.status(400).json({ erreur: 'La date de début doit être antérieure ou égale à la date de fin.' });
    }
  }

  try {
    const { select, group } = INTERVALLES[intervalle];
    let sql;
    let params;

    if (debutIso && finIso) {
      sql = `SELECT ${select}, SUM(nb_passages) AS total_passages
             FROM comptage_velo
             WHERE id_compteur = ? AND date(date_heure) BETWEEN ? AND ?
             GROUP BY ${group} ORDER BY ${group}`;
      params = [parseInt(id, 10), debutIso, finIso];
    } else {
      sql = `SELECT ${select}, SUM(nb_passages) AS total_passages
             FROM comptage_velo
             WHERE id_compteur = ?
             GROUP BY ${group} ORDER BY ${group}`;
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
  } catch {
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
  } catch {
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
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/pointsdinteret — paginated list with optional filters
app.get('/gti525/v1/pointsdinteret', (req, res) => {
  const { nom, type, arrondissement } = req.query;
  const limite = Math.max(1, parseInt(req.query.limite, 10) || 20);
  const page   = Math.max(1, parseInt(req.query.page,   10) || 1);
  const offset = (page - 1) * limite;

  try {
    const conditions = [];
    const params     = [];

    if (nom)            { conditions.push("nom_parc_lieu LIKE ?"); params.push(`%${nom}%`); }
    if (type)           { conditions.push('type = ?');              params.push(type); }
    if (arrondissement) { conditions.push('arrondissement = ?');    params.push(arrondissement); }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const stmtCount = db.prepare(`SELECT COUNT(*) AS n FROM pointsdinteret${where}`);
    if (params.length) stmtCount.bind(params);
    const total = stmtCount.step() ? (stmtCount.getAsObject().n ?? 0) : 0;
    stmtCount.free();

    const stmtData = db.prepare(
      `SELECT id AS ID, arrondissement AS Arrondissement,
              nom_parc_lieu AS Nom_parc_lieu,
              proximite_jeux_repere AS "Proximité_jeux_repère",
              intersection AS Intersection, etat AS Etat,
              date_installation AS Date_installation, remarque AS Remarque,
              precision_localisation AS Precision_localisation,
              x AS X, y AS Y, longitude AS Longitude, latitude AS Latitude,
              type AS Type
       FROM pointsdinteret${where} ORDER BY id LIMIT ? OFFSET ?`
    );
    stmtData.bind([...params, limite, offset]);
    const donnees = [];
    while (stmtData.step()) donnees.push(stmtData.getAsObject());
    stmtData.free();

    res.json({ donnees, total, page, limite });
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// POST /gti525/v1/pointsdinteret — create a new point of interest
app.post('/gti525/v1/pointsdinteret', requireAuth, (req, res) => {
  const body = req.body ?? {};
  const { nom_parc_lieu, latitude, longitude } = body;
  if (!nom_parc_lieu || latitude == null || longitude == null) {
    return res.status(400).json({ erreur: 'Champs requis : nom_parc_lieu, latitude, longitude.' });
  }
  try {
    const stmtIns = db.prepare(
      `INSERT INTO pointsdinteret
         (arrondissement, nom_parc_lieu, proximite_jeux_repere, intersection,
          etat, date_installation, remarque, precision_localisation,
          x, y, longitude, latitude, type)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    stmtIns.bind([
      body.arrondissement         ?? null,
      nom_parc_lieu,
      body.proximite_jeux_repere  ?? null,
      body.intersection           ?? null,
      body.etat                   ?? null,
      body.date_installation      ?? null,
      body.remarque               ?? null,
      body.precision_localisation ?? null,
      body.x        != null ? parseFloat(body.x)         : null,
      body.y        != null ? parseFloat(body.y)         : null,
      parseFloat(longitude),
      parseFloat(latitude),
      body.type ?? null,
    ]);
    stmtIns.step();
    stmtIns.free();

    const stmtLast = db.prepare('SELECT last_insert_rowid() AS id');
    const newId = stmtLast.step() ? stmtLast.getAsObject().id : null;
    stmtLast.free();

    return res.status(201).json({ id: newId, ...body });
  } catch {
    return res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// PUT /gti525/v1/pointsdinteret/:id — update an existing point of interest
app.put('/gti525/v1/pointsdinteret/:id', requireAuth, (req, res) => {
  const poiId = parseInt(req.params.id, 10);
  if (isNaN(poiId)) return res.status(400).json({ erreur: 'Identifiant invalide.' });

  const body = req.body ?? {};
  try {
    const stmtCheck = db.prepare('SELECT id FROM pointsdinteret WHERE id = ?');
    stmtCheck.bind([poiId]);
    const exists = stmtCheck.step();
    stmtCheck.free();
    if (!exists) return res.status(404).json({ erreur: 'Point d\'intérêt introuvable.' });

    const stmtUpd = db.prepare(
      `UPDATE pointsdinteret SET
         arrondissement = ?, nom_parc_lieu = ?, proximite_jeux_repere = ?,
         intersection = ?, etat = ?, date_installation = ?, remarque = ?,
         precision_localisation = ?, x = ?, y = ?, longitude = ?, latitude = ?, type = ?
       WHERE id = ?`
    );
    stmtUpd.bind([
      body.arrondissement         ?? null,
      body.nom_parc_lieu          ?? null,
      body.proximite_jeux_repere  ?? null,
      body.intersection           ?? null,
      body.etat                   ?? null,
      body.date_installation      ?? null,
      body.remarque               ?? null,
      body.precision_localisation ?? null,
      body.x         != null ? parseFloat(body.x)         : null,
      body.y         != null ? parseFloat(body.y)         : null,
      body.longitude != null ? parseFloat(body.longitude) : null,
      body.latitude  != null ? parseFloat(body.latitude)  : null,
      body.type ?? null,
      poiId,
    ]);
    stmtUpd.step();
    stmtUpd.free();

    return res.status(200).json({ id: poiId, ...body });
  } catch {
    return res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// DELETE /gti525/v1/pointsdinteret/:id — delete a point of interest
app.delete('/gti525/v1/pointsdinteret/:id', requireAuth, (req, res) => {
  const poiId = parseInt(req.params.id, 10);
  if (isNaN(poiId)) return res.status(400).json({ erreur: 'Identifiant invalide.' });

  try {
    const stmtCheck = db.prepare('SELECT id FROM pointsdinteret WHERE id = ?');
    stmtCheck.bind([poiId]);
    const exists = stmtCheck.step();
    stmtCheck.free();
    if (!exists) return res.status(404).json({ erreur: 'Point d\'intérêt introuvable.' });

    const stmtDel = db.prepare('DELETE FROM pointsdinteret WHERE id = ?');
    stmtDel.bind([poiId]);
    stmtDel.step();
    stmtDel.free();

    return res.status(204).send();
  } catch {
    return res.status(500).json({ erreur: 'Database query failed.' });
  }
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

    // utilisateurs table
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
      annee_implante INTEGER,
      arrondissement TEXT
    )`);
    db.run('BEGIN TRANSACTION');
    const compteurRows = parseCsv(fs.readFileSync(path.join(DATA_DIR, 'compteurs.csv'), 'utf8'));
    const stmtC = db.prepare('INSERT OR IGNORE INTO compteurs VALUES (?,?,?,?,?,?,?)');
    for (const r of compteurRows) {
      stmtC.bind([r.ID, r.Nom, r.Statut, parseFloat(r.Latitude), parseFloat(r.Longitude), parseInt(r.Annee_implante, 10), null]);
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
      x REAL, y REAL, longitude REAL, latitude REAL,
      type                   TEXT
    )`);
    db.run('BEGIN TRANSACTION');
    const poiRows = parseCsv(fs.readFileSync(path.join(DATA_DIR, 'poi.csv'), 'utf8'));
    const stmtP = db.prepare('INSERT OR IGNORE INTO pointsdinteret VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    for (const r of poiRows) {
      stmtP.bind([
        parseInt(r.ID, 10), r.Arrondissement, r.Nom_parc_lieu,
        r['Proximité_jeux_repère'], r.Intersection, r.Etat,
        r.Date_installation, r.Remarque, r.Precision_localisation,
        parseFloat(r.X), parseFloat(r.Y), parseFloat(r.Longitude), parseFloat(r.Latitude),
        'Fontaine',
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
        p.NOM_ARR_VILLE_DESC  ?? null,
        p.AVANCEMENT_CODE     ?? null,
        p.TYPE_VOIE_CODE      ?? null,
        p.REV_AVANCEMENT_CODE ?? null,
        p.SAISONS4            ?? null,
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
