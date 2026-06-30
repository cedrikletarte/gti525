'use strict';

const express = require('express');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const PORT = 8080;

const app = express();
let db;

// Converts YYMMDD → YYYY-MM-DD. Returns null if the format is invalid.
function parseYYMMDD(yymmdd) {
  if (typeof yymmdd !== 'string' || !/^\d{6}$/.test(yymmdd)) return null;
  const yy = yymmdd.slice(0, 2);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
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

// GET /gti525/v1/compteurs — returns all counters (from compteurs.csv)
app.get('/gti525/v1/compteurs', (req, res) => {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, 'compteurs.csv'), 'utf8');
    res.json(parseCsv(content));
  } catch (_err) {
    res.status(500).json({ erreur: 'Failed to read the counter list.' });
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
  let finIso = null;

  if (debut !== undefined || fin !== undefined) {
    if (!debut || !fin) {
      return res.status(400).json({ erreur: 'Parameters debut and fin must be provided together (format YYMMDD).' });
    }
    debutIso = parseYYMMDD(debut);
    finIso = parseYYMMDD(fin);
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
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    if (rows.length === 0) {
      return res.status(404).json({ erreur: 'No data found for this counter in the requested period.' });
    }

    res.json(rows);
  } catch (_err) {
    res.status(500).json({ erreur: 'Database query failed.' });
  }
});

// GET /gti525/v1/pistes — bike network (GeoJSON)
app.get('/gti525/v1/pistes', (req, res) => {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, 'reseau_cyclable.geojson'), 'utf8');
    res.setHeader('Content-Type', 'application/geo+json');
    res.send(content);
  } catch (_err) {
    res.status(500).json({ erreur: 'Failed to read the bike network file.' });
  }
});

// GET /gti525/v1/territoires — borough boundaries (GeoJSON)
app.get('/gti525/v1/territoires', (req, res) => {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, 'territoires.geojson'), 'utf8');
    res.setHeader('Content-Type', 'application/geo+json');
    res.send(content);
  } catch (_err) {
    res.status(500).json({ erreur: 'Failed to read the borough boundaries file.' });
  }
});

// GET /gti525/v1/pointsdinteret — points of interest (poi.csv → JSON)
app.get('/gti525/v1/pointsdinteret', (req, res) => {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, 'poi.csv'), 'utf8');
    res.json(parseCsv(content));
  } catch (_err) {
    res.status(500).json({ erreur: 'Failed to read the points of interest file.' });
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
    app.listen(PORT, () => {
      console.log(`Serveur GTI525 démarré sur http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to load the database:', err.message);
    process.exit(1);
  });
}
