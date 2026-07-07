'use strict';

const request = require('supertest');
const { app, setDb } = require('../server');

function makeDb(rows) {
  let index = 0;
  const stmt = {
    bind: jest.fn(),
    step: jest.fn(() => index < rows.length),
    getAsObject: jest.fn(() => rows[index++]),
    free: jest.fn(),
  };
  return { prepare: jest.fn(() => stmt) };
}

const FEATURE_FIXTURE = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [[-73.55, 45.51], [-73.56, 45.52]],
  },
  properties: {
    NOM_ARR_VILLE_DESC: 'Rosemont',
    TYPE_VOIE_CODE: 'REP',
  },
};

describe('Route GET /gti525/v1/pistes', () => {
  it('devrait retourner 200 avec Content-Type application/geo+json', async () => {
    setDb(makeDb([{ feature: JSON.stringify(FEATURE_FIXTURE) }]));

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch('application/geo+json');
  });

  it('devrait retourner une FeatureCollection GeoJSON valide avec un tableau de features', async () => {
    setDb(makeDb([{ feature: JSON.stringify(FEATURE_FIXTURE) }]));

    const res = await request(app).get('/gti525/v1/pistes');

    const body = JSON.parse(res.text);
    expect(body).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(body.features)).toBe(true);
    expect(body.features.length).toBeGreaterThan(0);
  });

  it('devrait retourner 500 avec un message d\'erreur quand la base est inaccessible', async () => {
    setDb({ prepare: () => { throw new Error('DB error'); } });

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Database query failed.');
  });
});
