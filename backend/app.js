'use strict';
const express        = require('express');
const { setDb }      = require('./lib/db');
const listEndpoints  = require('./lib/listEndpoints');
const endpointsMeta  = require('./lib/endpointsMeta');

const app = express();
app.use(express.json());

const DISCOVERY_PATH = '/gti525/v1/';
const mounts = [
  { path: '/gti525/v1/auth',           router: require('./routes/auth') },
  { path: '/gti525/v1/compteurs',      router: require('./routes/compteurs') },
  { path: '/gti525/v1/pistes',         router: require('./routes/pistes') },
  { path: '/gti525/v1/territoires',    router: require('./routes/territoires') },
  { path: '/gti525/v1/pointsdinteret', router: require('./routes/pointsdinteret') },
];

app.get(DISCOVERY_PATH, (_req, res) => {
  const endpoints = [
    { methode: 'GET', chemin: DISCOVERY_PATH },
    ...mounts.flatMap(({ path, router }) => listEndpoints(router, path)),
  ].map((endpoint) => ({ ...endpoint, ...endpointsMeta[`${endpoint.methode} ${endpoint.chemin}`] }));

  res.json({ api: 'GTI525 — MTL Vélo', version: 'v1', endpoints });
});

mounts.forEach(({ path, router }) => app.use(path, router));

app.use((_req, res) => res.status(404).json({ erreur: 'Route not found.' }));

module.exports = { app, setDb };
