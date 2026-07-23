'use strict';
const router           = require('express').Router();
const { pool }         = require('../lib/db');
const { parseISODate } = require('../lib/utils');
const { normArr, CATEGORIE_SQL } = require('../lib/geo');

router.get('/', async (req, res) => {
  const { arrondissement, saisons4, categorie, populaireDebut, populaireFin } = req.query;

  if (categorie && !CATEGORIE_SQL[categorie]) {
    return res.status(400).json({ erreur: 'Catégorie invalide. Valeurs acceptées : rev, voiePartagee, voieProtegee, sentierPolyvalent.' });
  }

  let debutPop = null;
  let finPop   = null;
  if (populaireDebut !== undefined || populaireFin !== undefined) {
    if (!populaireDebut || !populaireFin) {
      return res.status(400).json({ erreur: 'Les paramètres populaireDebut et populaireFin doivent être fournis ensemble (format YYYY-MM-DD).' });
    }
    debutPop = parseISODate(populaireDebut);
    finPop   = parseISODate(populaireFin);
    if (!debutPop || !finPop) {
      return res.status(400).json({ erreur: 'Format de date invalide. Utilisez YYYY-MM-DD (ex. 2022-01-01).' });
    }
    if (debutPop > finPop) {
      return res.status(400).json({ erreur: 'populaireDebut doit être antérieur ou égal à populaireFin.' });
    }
  }

  try {
    const conditions = [];
    const params     = [];

    if (arrondissement) { conditions.push('nom_arr_ville_desc = ?'); params.push(arrondissement); }
    if (saisons4)       { conditions.push('saisons4 = ?');           params.push(saisons4); }
    if (categorie)      { conditions.push(CATEGORIE_SQL[categorie]); }

    if (debutPop && finPop) {
      const [popRows] = await pool.query(`
        SELECT c.arrondissement,
               SUM(p.nb_passages)            AS total_passages,
               COUNT(DISTINCT p.id_compteur) AS n_compteurs
        FROM   passages p
        JOIN   compteurs c ON CAST(p.id_compteur AS CHAR) = c.id
        WHERE  DATE(p.date_heure) BETWEEN ? AND ?
        AND    c.arrondissement IS NOT NULL
        GROUP  BY c.arrondissement
        ORDER BY SUM(p.nb_passages) / COUNT(DISTINCT p.id_compteur) DESC
        LIMIT  3
      `, [debutPop, finPop]);

      const top3 = popRows.map(r => normArr(r.arrondissement));
      if (!top3.length) {
          res.setHeader('Content-Type', 'application/geo+json');
          return res.json({ type: 'FeatureCollection', features: [] });
      }

        conditions.push(`norm_arr IN (${top3.map(() => '?').join(',')})`);
        params.push(...top3);
    }

    let sql = 'SELECT feature FROM pistes';
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

    const [rows] = await pool.query(sql, params);
    const features = rows.map(r => JSON.parse(r.feature));

    res.setHeader('Content-Type', 'application/geo+json');
    res.json({ type: 'FeatureCollection', features });
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

module.exports = router;
