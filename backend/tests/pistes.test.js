'use strict';

const request = require('supertest');
const fs = require('fs');
const { app } = require('../server');

const GEOJSON_FIXTURE = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[-73.55, 45.51], [-73.56, 45.52]],
      },
      properties: {
        NOM_ARR_VI: 'Rosemont',
        TYPE_VOIE: 'REP',
        NOM_VOIE: 'Rachel',
      },
    },
  ],
});

describe('Route GET /gti525/v1/pistes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devrait retourner 200 avec Content-Type application/geo+json', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(GEOJSON_FIXTURE);

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch('application/geo+json');
  });

  it('devrait retourner une FeatureCollection GeoJSON valide avec un tableau de features', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(GEOJSON_FIXTURE);

    const res = await request(app).get('/gti525/v1/pistes');

    const body = JSON.parse(res.text);
    expect(body).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(body.features)).toBe(true);
    expect(body.features.length).toBeGreaterThan(0);
  });

  it('devrait retourner 500 avec un message d\'erreur quand le fichier GeoJSON est inaccessible', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Failed to read the bike network file.');
  });
});
