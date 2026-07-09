'use strict';
const router      = require('express').Router();
const { getDb }   = require('../lib/db');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
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
    const db    = getDb();

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

router.post('/', requireAuth, (req, res) => {
  const body = req.body ?? {};
  const { nom_parc_lieu, latitude, longitude } = body;
  if (!nom_parc_lieu || latitude == null || longitude == null) {
    return res.status(400).json({ erreur: 'Champs requis : nom_parc_lieu, latitude, longitude.' });
  }
  try {
    const db      = getDb();
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
      body.x   != null ? parseFloat(body.x)   : null,
      body.y   != null ? parseFloat(body.y)   : null,
      parseFloat(longitude),
      parseFloat(latitude),
      body.type ?? null,
    ]);
    stmtIns.step();
    stmtIns.free();

    const stmtLast = db.prepare('SELECT last_insert_rowid() AS id');
    const newId    = stmtLast.step() ? stmtLast.getAsObject().id : null;
    stmtLast.free();

    return res.status(201).json({ id: newId, ...body });
  } catch {
    return res.status(500).json({ erreur: 'Database query failed.' });
  }
});

router.put('/:id', requireAuth, (req, res) => {
  const poiId = parseInt(req.params.id, 10);
  if (isNaN(poiId)) return res.status(400).json({ erreur: 'Identifiant invalide.' });

  const body = req.body ?? {};
  try {
    const db        = getDb();
    const stmtCheck = db.prepare('SELECT id FROM pointsdinteret WHERE id = ?');
    stmtCheck.bind([poiId]);
    const exists = stmtCheck.step();
    stmtCheck.free();
    if (!exists) return res.status(404).json({ erreur: "Point d'intérêt introuvable." });

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

router.delete('/:id', requireAuth, (req, res) => {
  const poiId = parseInt(req.params.id, 10);
  if (isNaN(poiId)) return res.status(400).json({ erreur: 'Identifiant invalide.' });

  try {
    const db        = getDb();
    const stmtCheck = db.prepare('SELECT id FROM pointsdinteret WHERE id = ?');
    stmtCheck.bind([poiId]);
    const exists = stmtCheck.step();
    stmtCheck.free();
    if (!exists) return res.status(404).json({ erreur: "Point d'intérêt introuvable." });

    const stmtDel = db.prepare('DELETE FROM pointsdinteret WHERE id = ?');
    stmtDel.bind([poiId]);
    stmtDel.step();
    stmtDel.free();

    return res.status(204).send();
  } catch {
    return res.status(500).json({ erreur: 'Database query failed.' });
  }
});

module.exports = router;
