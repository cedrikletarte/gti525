'use strict';
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET manquant dans .env');
  process.exit(1);
}

const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');
const { app }   = require('./app');
const { setDb } = require('./lib/db');
const { normArr, pointInFeature } = require('./lib/geo');
const { parseCsv } = require('./lib/utils');

const DATA_DIR = path.join(__dirname, 'data');
const PORT     = 8080;

module.exports = { app, setDb };

if (require.main === module) {
  initSqlJs().then(SQL => {
    const fileBuffer = fs.readFileSync(path.join(DATA_DIR, 'comptage_velo.db'));
    const db = new SQL.Database(fileBuffer);
    setDb(db);

    db.run(`CREATE TABLE IF NOT EXISTS utilisateurs (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      courriel TEXT    NOT NULL UNIQUE,
      mdp_hash TEXT    NOT NULL,
      cree_le  TEXT    NOT NULL DEFAULT (datetime('now'))
    )`);

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
    const stmtC = db.prepare('INSERT OR IGNORE INTO compteurs VALUES (?,?,?,?,?,?,?)');
    for (const r of parseCsv(fs.readFileSync(path.join(DATA_DIR, 'compteurs.csv'), 'utf8'))) {
      stmtC.bind([r.ID, r.Nom, r.Statut, parseFloat(r.Latitude), parseFloat(r.Longitude), parseInt(r.Annee_implante, 10), null]);
      stmtC.step(); stmtC.reset();
    }
    stmtC.free();
    db.run('COMMIT');

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
    const stmtP = db.prepare('INSERT OR IGNORE INTO pointsdinteret VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    for (const r of parseCsv(fs.readFileSync(path.join(DATA_DIR, 'poi.csv'), 'utf8'))) {
      stmtP.bind([
        parseInt(r.ID, 10), r.Arrondissement, r.Nom_parc_lieu,
        r['Proximité_jeux_repère'], r.Intersection, r.Etat,
        r.Date_installation, r.Remarque, r.Precision_localisation,
        parseFloat(r.X), parseFloat(r.Y), parseFloat(r.Longitude), parseFloat(r.Latitude),
        'Fontaine',
      ]);
      stmtP.step(); stmtP.reset();
    }
    stmtP.free();
    db.run('COMMIT');

    db.run(`CREATE TABLE IF NOT EXISTS pistes (
      id_cycl             INTEGER PRIMARY KEY,
      feature             TEXT NOT NULL,
      nom_arr_ville_desc  TEXT,
      avancement_code     TEXT,
      type_voie_code      TEXT,
      rev_avancement_code TEXT,
      saisons4            TEXT,
      norm_arr            TEXT
    )`);
    db.run('BEGIN TRANSACTION');
    const pistesGeoJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'reseau_cyclable.geojson'), 'utf8'));
    const stmtF = db.prepare('INSERT OR IGNORE INTO pistes VALUES (?,?,?,?,?,?,?,?)');
    for (const feature of pistesGeoJson.features) {
      const p = feature.properties;
      stmtF.bind([
        p.ID_CYCL, JSON.stringify(feature),
        p.NOM_ARR_VILLE_DESC  ?? null,
        p.AVANCEMENT_CODE     ?? null,
        p.TYPE_VOIE_CODE      ?? null,
        p.REV_AVANCEMENT_CODE ?? null,
        p.SAISONS4            ?? null,
        normArr(p.NOM_ARR_VILLE_DESC ?? ''),
      ]);
      stmtF.step(); stmtF.reset();
    }
    stmtF.free();
    db.run('COMMIT');

    db.run(`CREATE TABLE IF NOT EXISTS territoires (
      nom     TEXT NOT NULL PRIMARY KEY,
      feature TEXT NOT NULL
    )`);
    db.run('BEGIN TRANSACTION');
    const territoiresGeoJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'territoires.geojson'), 'utf8'));
    const stmtT = db.prepare('INSERT OR IGNORE INTO territoires VALUES (?,?)');
    for (const feature of territoiresGeoJson.features) {
      stmtT.bind([feature.properties.NOM, JSON.stringify(feature)]);
      stmtT.step(); stmtT.reset();
    }
    stmtT.free();
    db.run('COMMIT');

    // Populate compteurs.arrondissement via point-in-polygon against territories
    const terFeatures = [];
    const stmtTerLoad = db.prepare('SELECT feature FROM territoires');
    while (stmtTerLoad.step()) terFeatures.push(JSON.parse(stmtTerLoad.getAsObject().feature));
    stmtTerLoad.free();

    const stmtCptLoad = db.prepare('SELECT id, latitude, longitude FROM compteurs');
    const stmtCptUpd  = db.prepare('UPDATE compteurs SET arrondissement = ? WHERE id = ?');
    while (stmtCptLoad.step()) {
      const { id, latitude, longitude } = stmtCptLoad.getAsObject();
      const found = terFeatures.find(f => pointInFeature(longitude, latitude, f));
      if (found) {
        stmtCptUpd.bind([found.properties.NOM, id]);
        stmtCptUpd.step(); stmtCptUpd.reset();
      }
    }
    stmtCptLoad.free();
    stmtCptUpd.free();

    app.listen(PORT, () => {
      console.log(`Serveur GTI525 démarré sur http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to load the database:', err.message);
    process.exit(1);
  });
}
