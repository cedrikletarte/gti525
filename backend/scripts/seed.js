'use strict';

const path      = require('path');
const fs        = require('fs');
const mysql     = require('mysql2/promise');
const initSqlJs = require('sql.js');
const { parseCsv }                    = require('../lib/utils');
const { normArr, pointInFeature }     = require('../lib/geo');

const DATA_DIR = path.join(__dirname, '../data');

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS utilisateurs (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    courriel VARCHAR(255) NOT NULL UNIQUE,
    mdp_hash VARCHAR(255) NOT NULL,
    cree_le  DATETIME NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS compteurs (
    id             VARCHAR(30) PRIMARY KEY,
    nom            VARCHAR(255),
    statut         VARCHAR(50),
    latitude       DECIMAL(10,7),
    longitude      DECIMAL(11,7),
    annee_implante INT,
    arrondissement VARCHAR(100)
  )`,
  `CREATE TABLE IF NOT EXISTS passages (
    id_compteur BIGINT NOT NULL,
    date_heure  DATETIME NOT NULL,
    nb_passages INT NOT NULL,
    INDEX idx_compteur_date (id_compteur, date_heure)
  )`,
  `CREATE TABLE IF NOT EXISTS pointsdinteret (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    arrondissement         VARCHAR(100),
    nom_parc_lieu          VARCHAR(255),
    proximite_jeux_repere  VARCHAR(255),
    intersection           VARCHAR(255),
    etat                   VARCHAR(50),
    date_installation      VARCHAR(50),
    remarque               TEXT,
    precision_localisation VARCHAR(100),
    x DECIMAL(15,6), y DECIMAL(15,6),
    longitude DECIMAL(11,7), latitude DECIMAL(10,7),
    type VARCHAR(50)
  )`,
  `CREATE TABLE IF NOT EXISTS pistes (
    id_cycl             INT PRIMARY KEY,
    feature             LONGTEXT NOT NULL,
    nom_arr_ville_desc  VARCHAR(100),
    avancement_code     VARCHAR(10),
    type_voie_code      VARCHAR(10),
    rev_avancement_code VARCHAR(10),
    saisons4            VARCHAR(10),
    norm_arr            VARCHAR(100)
  )`,
  `CREATE TABLE IF NOT EXISTS territoires (
    nom     VARCHAR(100) PRIMARY KEY,
    feature LONGTEXT NOT NULL
  )`,
];

function makeConn() {
  return mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     Number(process.env.DB_PORT || 3306),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

async function runSeed(conn) {
  // Compteurs
  const compteurRows = parseCsv(fs.readFileSync(path.join(DATA_DIR, 'compteurs.csv'), 'utf8'));
  for (const r of compteurRows) {
    await conn.query(
      'INSERT IGNORE INTO compteurs (id, nom, statut, latitude, longitude, annee_implante) VALUES (?,?,?,?,?,?)',
      [r.ID, r.Nom, r.Statut, parseFloat(r.Latitude) || null, parseFloat(r.Longitude) || null, parseInt(r.Annee_implante, 10) || null]
    );
  }
  console.log(`  ${compteurRows.length} compteurs insérés.`);

  // Territoires
  const territoiresGeoJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'territoires.geojson'), 'utf8'));
  for (const feature of territoiresGeoJson.features) {
    await conn.query(
      'INSERT IGNORE INTO territoires (nom, feature) VALUES (?,?)',
      [feature.properties.NOM, JSON.stringify(feature)]
    );
  }
  console.log(`  ${territoiresGeoJson.features.length} territoires insérés.`);

  // Arrondissement des compteurs
  const [cptRows] = await conn.query('SELECT id, latitude, longitude FROM compteurs');
  let arrCount = 0;
  for (const c of cptRows) {
    const found = territoiresGeoJson.features.find(f => pointInFeature(c.longitude, c.latitude, f));
    if (found) {
      await conn.query('UPDATE compteurs SET arrondissement = ? WHERE id = ?', [found.properties.NOM, c.id]);
      arrCount++;
    }
  }
  console.log(`  ${arrCount} compteurs géolocalisés.`);

  // POI
  const poiRows = parseCsv(fs.readFileSync(path.join(DATA_DIR, 'poi.csv'), 'utf8'));
  for (const r of poiRows) {
    await conn.query(
      `INSERT IGNORE INTO pointsdinteret
         (id, arrondissement, nom_parc_lieu, proximite_jeux_repere, intersection,
          etat, date_installation, remarque, precision_localisation,
          x, y, longitude, latitude, type)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        parseInt(r.ID, 10), r.Arrondissement, r.Nom_parc_lieu,
        r['Proximité_jeux_repère'], r.Intersection, r.Etat,
        r.Date_installation, r.Remarque, r.Precision_localisation,
        parseFloat(r.X) || null, parseFloat(r.Y) || null,
        parseFloat(r.Longitude) || null, parseFloat(r.Latitude) || null,
        'Fontaine',
      ]
    );
  }
  console.log(`  ${poiRows.length} points d'intérêt insérés.`);

  // Pistes
  const pistesGeoJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'reseau_cyclable.geojson'), 'utf8'));
  for (const feature of pistesGeoJson.features) {
    const p = feature.properties;
    await conn.query(
      'INSERT IGNORE INTO pistes (id_cycl, feature, nom_arr_ville_desc, avancement_code, type_voie_code, rev_avancement_code, saisons4, norm_arr) VALUES (?,?,?,?,?,?,?,?)',
      [
        p.ID_CYCL, JSON.stringify(feature),
        p.NOM_ARR_VILLE_DESC  ?? null,
        p.AVANCEMENT_CODE     ?? null,
        p.TYPE_VOIE_CODE      ?? null,
        p.REV_AVANCEMENT_CODE ?? null,
        p.SAISONS4            ?? null,
        normArr(p.NOM_ARR_VILLE_DESC ?? ''),
      ]
    );
  }
  console.log(`  ${pistesGeoJson.features.length} pistes insérées.`);

  // Passages (depuis comptage_velo.db via sql.js)
  console.log('  Chargement de comptage_velo.db (peut prendre 1-2 min)...');
  const SQL   = await initSqlJs();
  const sqlDb = new SQL.Database(fs.readFileSync(path.join(DATA_DIR, 'comptage_velo.db')));
  const stmt  = sqlDb.prepare('SELECT id_compteur, date_heure, nb_passages FROM comptage_velo');

  const BATCH = 1000;
  let batch = [];
  let total = 0;

  async function flushBatch() {
    if (batch.length === 0) return;
    await conn.query('INSERT IGNORE INTO passages (id_compteur, date_heure, nb_passages) VALUES ?', [batch]);
    total += batch.length;
    batch = [];
  }

  while (stmt.step()) {
    const { id_compteur, date_heure, nb_passages } = stmt.getAsObject();
    batch.push([id_compteur, date_heure, nb_passages]);
    if (batch.length >= BATCH) await flushBatch();
  }
  await flushBatch();
  stmt.free();
  sqlDb.close();

  console.log(`  ${total} passages insérés.`);
}

async function seedIfEmpty() {
  const conn = await makeConn();
  try {
    for (const sql of SCHEMA_STATEMENTS) await conn.query(sql);
    console.log('Tables vérifiées.');

    const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM compteurs');
    if (Number(n) > 0) {
      console.log(`DB déjà peuplée (${n} compteurs), seed ignoré.`);
      return;
    }

    console.log('DB vide — démarrage du seed...');
    await runSeed(conn);
    console.log('Seed terminé.');
  } finally {
    await conn.end();
  }
}

module.exports = { seedIfEmpty };

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  seedIfEmpty().catch(err => { console.error('Erreur seed :', err.message); process.exit(1); });
}
