'use strict';
const router    = require('express').Router();
const { pool }  = require('../lib/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT feature FROM territoires');
    const features = rows.map(r => JSON.parse(r.feature));

    res.setHeader('Content-Type', 'application/geo+json');
    res.json({ type: 'FeatureCollection', features });
  } catch {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

module.exports = router;
