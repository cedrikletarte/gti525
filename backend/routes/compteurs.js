'use strict';
const router           = require('express').Router();
const { pool }         = require('../lib/db');
const { parseISODate } = require('../lib/utils');

router.get('/', async (req, res) => {
  const { nom, statut, arrondissement, implantation } = req.query;
  const limite = Math.max(1, parseInt(req.query.limite, 10) || 20);
  const page   = Math.max(1, parseInt(req.query.page,   10) || 1);
  const offset = (page - 1) * limite;

  try {
    const conditions = [];
    const params     = [];

    if (nom)            { conditions.push('nom LIKE ?');          params.push(`%${nom}%`); }
    if (statut)         { conditions.push('statut = ?');           params.push(statut); }
    if (arrondissement) { conditions.push('arrondissement = ?');   params.push(arrondissement); }
    if (implantation)   { conditions.push('annee_implante >= ?');  params.push(parseInt(implantation, 10)); }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS n FROM compteurs${where}`, params);
    const total = countRow.n ?? 0;

    const [donnees] = await pool.query(
      `SELECT id AS ID, nom AS Nom, statut AS Statut,
              latitude AS Latitude, longitude AS Longitude,
              annee_implante AS Annee_implante, arrondissement AS Arrondissement
       FROM compteurs${where} ORDER BY id LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );

    res.json({ donnees, total, page, limite });
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id AS ID, nom AS Nom, statut AS Statut,
              latitude AS Latitude, longitude AS Longitude,
              annee_implante AS Annee_implante, arrondissement AS Arrondissement
       FROM compteurs WHERE id = ?`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ erreur: 'Compteur introuvable.' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

router.get('/:id/passages', async (req, res) => {
  const { id } = req.params;
  const { debut, fin, intervalle = 'jour' } = req.query;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ erreur: 'Invalid counter identifier.' });
  }

  const INTERVALLES = {
    jour:    { select: "DATE(date_heure) AS jour",                                                    group: "DATE(date_heure)" },
    semaine: { select: "CONCAT(YEAR(date_heure),'-',LPAD(WEEK(date_heure,3),2,'0')) AS semaine",      group: "YEARWEEK(date_heure,3)" },
    mois:    { select: "DATE_FORMAT(date_heure, '%Y-%m') AS mois",                                    group: "DATE_FORMAT(date_heure, '%Y-%m')" },
  };

  if (!INTERVALLES[intervalle]) {
    return res.status(400).json({ erreur: 'Intervalle invalide. Valeurs acceptées : jour, semaine, mois.' });
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
                FROM passages
                WHERE id_compteur = ? AND DATE(date_heure) BETWEEN ? AND ?
                GROUP BY ${group} ORDER BY ${group}`;
      params = [parseInt(id, 10), debutIso, finIso];
    } else {
      sql    = `SELECT ${select}, SUM(nb_passages) AS total_passages
                FROM passages
                WHERE id_compteur = ?
                GROUP BY ${group} ORDER BY ${group}`;
      params = [parseInt(id, 10)];
    }

    const [rows] = await pool.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ erreur: 'No data found for this counter in the requested period.' });
    }

    res.json(rows);
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

module.exports = router;
