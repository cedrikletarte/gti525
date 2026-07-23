import express from 'express';
import cors from 'cors';
import listEndpoints from './lib/listEndpoints.js';
import endpointsMeta from './lib/endpointsMeta.js';
import authRouter from './routers/authRouter.js';
import compteursRouter from './routers/compteursRouter.js';
import pistesRouter from './routers/pistesRouter.js';
import territoiresRouter from './routers/territoiresRouter.js';
import pointsDInteretRouter from './routers/pointsDInteretRouter.js';
import assistantRouter from './routers/assistantRouter.js';
import { Reponse } from './controllers/util.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const DISCOVERY_PATH = '/gti525/v1/';
const mounts = [
  { path: '/gti525/v1/auth',           router: authRouter },
  { path: '/gti525/v1/compteurs',      router: compteursRouter },
  { path: '/gti525/v1/pistes',         router: pistesRouter },
  { path: '/gti525/v1/territoires',    router: territoiresRouter },
  { path: '/gti525/v1/pointsdinteret', router: pointsDInteretRouter },
  { path: '/gti525/v1/assistant',      router: assistantRouter },
];

app.get(DISCOVERY_PATH, (_req, res) => {
  const endpoints = [
    { methode: 'GET', chemin: DISCOVERY_PATH },
    ...mounts.flatMap(({ path, router }) => listEndpoints(router, path)),
  ].map((endpoint) => ({ ...endpoint, ...endpointsMeta[`${endpoint.methode} ${endpoint.chemin}`] }));

  res.json(Reponse.ok({ api: 'GTI525 — MTL Vélo', version: 'v1', endpoints }));
});

mounts.forEach(({ path, router }) => app.use(path, router));

app.use((_req, res) => res.status(404).json(Reponse.erreur(404, 'Route not found.')));

export { app };
