'use strict';

jest.mock('../lib/db', () => ({
  pool: { query: jest.fn() },
}));

const request = require('supertest');
const { app }  = require('../server');
const { pool } = require('../lib/db');

beforeEach(() => pool.query.mockReset());

const FEATURE_FIXTURE = {
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: [[-73.55, 45.51], [-73.56, 45.52]] },
  properties: { NOM_ARR_VILLE_DESC: 'Rosemont', TYPE_VOIE_CODE: '1', REV_AVANCEMENT_CODE: null },
};

const FEATURE_STR = JSON.stringify(FEATURE_FIXTURE);

describe('Route GET /gti525/v1/pistes', () => {
  it('devrait retourner 200 avec Content-Type application/geo+json', async () => {
    pool.query.mockResolvedValueOnce([[{ feature: FEATURE_STR }], []]);

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch('application/geo+json');
  });

  it('devrait retourner une FeatureCollection GeoJSON valide avec un tableau de features', async () => {
    pool.query.mockResolvedValueOnce([[{ feature: FEATURE_STR }], []]);

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.body).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(res.body.features)).toBe(true);
    expect(res.body.features.length).toBeGreaterThan(0);
  });

  it('devrait retourner 200 avec ?categorie=voiePartagee', async () => {
    pool.query.mockResolvedValueOnce([[{ feature: FEATURE_STR }], []]);

    const res = await request(app).get('/gti525/v1/pistes?categorie=voiePartagee');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('type', 'FeatureCollection');
  });

  it('devrait retourner 400 pour une catégorie invalide', async () => {
    const res = await request(app).get('/gti525/v1/pistes?categorie=invalide');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 200 avec pistes populaires quand populaireDebut et populaireFin sont fournis', async () => {
    pool.query
      .mockResolvedValueOnce([[{ arrondissement: 'Rosemont - La Petite-Patrie', total_passages: 5000, n_compteurs: 2 }], []])
      .mockResolvedValueOnce([[{ feature: FEATURE_STR }], []]);

    const res = await request(app)
      .get('/gti525/v1/pistes?populaireDebut=2022-01-01&populaireFin=2022-12-31');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('type', 'FeatureCollection');
  });

  it('devrait retourner 400 quand populaireDebut est fourni sans populaireFin', async () => {
    const res = await request(app).get('/gti525/v1/pistes?populaireDebut=2022-01-01');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 400 quand populaireFin est fourni sans populaireDebut', async () => {
    const res = await request(app).get('/gti525/v1/pistes?populaireFin=2022-12-31');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 400 quand populaireDebut est postérieur à populaireFin', async () => {
    const res = await request(app)
      .get('/gti525/v1/pistes?populaireDebut=2022-12-31&populaireFin=2022-01-01');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur');
  });

  it("devrait retourner 500 avec un message d'erreur quand la base est inaccessible", async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Database query failed.');
  });
});
