'use strict';

const request = require('supertest');
const { app, setDb } = require('../server');

// Each prepare() call consumes the next row-set from rowSets.
function makeDb(rowSets) {
  let callIdx = 0;
  return {
    prepare: jest.fn(() => {
      const rows = rowSets[callIdx++] || [];
      let i = 0;
      return {
        bind: jest.fn(),
        step: jest.fn(() => i < rows.length),
        getAsObject: jest.fn(() => rows[i++]),
        free: jest.fn(),
        reset: jest.fn(),
      };
    }),
  };
}

const FEATURE_FIXTURE = {
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: [[-73.55, 45.51], [-73.56, 45.52]] },
  properties: { NOM_ARR_VILLE_DESC: 'Rosemont', TYPE_VOIE_CODE: '1', REV_AVANCEMENT_CODE: null },
};

const FEATURE_STR = JSON.stringify(FEATURE_FIXTURE);

describe('Route GET /gti525/v1/pistes', () => {
  it('devrait retourner 200 avec Content-Type application/geo+json', async () => {
    setDb(makeDb([[{ feature: FEATURE_STR }]]));

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch('application/geo+json');
  });

  it('devrait retourner une FeatureCollection GeoJSON valide avec un tableau de features', async () => {
    setDb(makeDb([[{ feature: FEATURE_STR }]]));

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.body).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(res.body.features)).toBe(true);
    expect(res.body.features.length).toBeGreaterThan(0);
  });

  it('devrait retourner 200 avec ?categorie=voiePartagee', async () => {
    setDb(makeDb([[{ feature: FEATURE_STR }]]));

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
    const popRow = { arrondissement: 'Rosemont - La Petite-Patrie', total_passages: 5000, n_compteurs: 2 };
    setDb(makeDb([[popRow], [{ feature: FEATURE_STR }]]));

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

  it('devrait retourner 500 avec un message d\'erreur quand la base est inaccessible', async () => {
    setDb({ prepare: () => { throw new Error('DB error'); } });

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Database query failed.');
  });
});
