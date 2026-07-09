'use strict';
const router    = require('express').Router();
const { getDb } = require('../lib/db');

router.get('/', (_req, res) => {
  try {
    const stmt = getDb().prepare('SELECT feature FROM territoires');
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
