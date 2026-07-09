'use strict';
const router           = require('express').Router();
const { getDb }        = require('../lib/db');
const { parseISODate } = require('../lib/utils');
const { normArr, CATEGORIE_SQL } = require('../lib/geo');

router.get('/', (req, res) => {
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
    const db         = getDb();

    if (arrondissement) { conditions.push('nom_arr_ville_desc = ?'); params.push(arrondissement); }
    if (saisons4)       { conditions.push('saisons4 = ?');           params.push(saisons4); }
    if (categorie)      { conditions.push(CATEGORIE_SQL[categorie]); }

    if (debutPop && finPop) {
      const stmtPop = db.prepare(`
        SELECT c.arrondissement,
               SUM(cv.nb_passages)            AS total_passages,
               COUNT(DISTINCT cv.id_compteur) AS n_compteurs
        FROM   comptage_velo cv
        JOIN   compteurs c ON CAST(cv.id_compteur AS TEXT) = c.id
        WHERE  date(cv.date_heure) BETWEEN ? AND ?
        AND    c.arrondissement IS NOT NULL
        GROUP  BY c.arrondissement
        ORDER  BY CAST(total_passages AS REAL) / n_compteurs DESC
        LIMIT  3
      `);
      stmtPop.bind([debutPop, finPop]);
      const top3 = [];
      while (stmtPop.step()) top3.push(normArr(stmtPop.getAsObject().arrondissement));
      stmtPop.free();

      if (top3.length) {
        conditions.push(`norm_arr IN (${top3.map(() => '?').join(',')})`);
        params.push(...top3);
      }
    }

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

module.exports = router;
