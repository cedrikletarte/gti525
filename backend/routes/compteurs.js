'use strict';
const router        = require('express').Router();
const { getDb }     = require('../lib/db');
const { parseISODate } = require('../lib/utils');

router.get('/', (req, res) => {
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
    const db    = getDb();

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

router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = getDb().prepare(
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

router.get('/:id/passages', (req, res) => {
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
      sql    = `SELECT ${select}, SUM(nb_passages) AS total_passages
                FROM comptage_velo
                WHERE id_compteur = ? AND date(date_heure) BETWEEN ? AND ?
                GROUP BY ${group} ORDER BY ${group}`;
      params = [parseInt(id, 10), debutIso, finIso];
    } else {
      sql    = `SELECT ${select}, SUM(nb_passages) AS total_passages
                FROM comptage_velo
                WHERE id_compteur = ?
                GROUP BY ${group} ORDER BY ${group}`;
      params = [parseInt(id, 10)];
    }

    const stmt = getDb().prepare(sql);
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

module.exports = router;
