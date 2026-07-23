import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../lib/db.js', () => ({
  pool: { query: mockQuery },
}));

const { default: request } = await import('supertest');
const { app } = await import('../server.js');

beforeEach(() => mockQuery.mockReset());

const FEATURE_FIXTURE = {
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: [[-73.55, 45.51], [-73.56, 45.52]] },
  properties: { NOM_ARR_VILLE_DESC: 'Rosemont', TYPE_VOIE_CODE: '1', REV_AVANCEMENT_CODE: null },
};

const FEATURE_STR = JSON.stringify(FEATURE_FIXTURE);

describe('Route GET /gti525/v1/pistes', () => {
  it('devrait retourner 200 avec une FeatureCollection GeoJSON valide sous data', async () => {
    mockQuery.mockResolvedValueOnce([[{ feature: FEATURE_STR }], []]);

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(res.body.data.features)).toBe(true);
    expect(res.body.data.features.length).toBeGreaterThan(0);
  });

  it('devrait retourner 200 avec ?categorie=voiePartagee', async () => {
    mockQuery.mockResolvedValueOnce([[{ feature: FEATURE_STR }], []]);

    const res = await request(app).get('/gti525/v1/pistes?categorie=voiePartagee');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('type', 'FeatureCollection');
  });

  it('devrait retourner 400 pour une catégorie invalide', async () => {
    const res = await request(app).get('/gti525/v1/pistes?categorie=invalide');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('devrait retourner 200 avec pistes populaires quand populaireDebut et populaireFin sont fournis', async () => {
    mockQuery
      .mockResolvedValueOnce([[{ arrondissement: 'Rosemont - La Petite-Patrie', total_passages: 5000, n_compteurs: 2 }], []])
      .mockResolvedValueOnce([[{ feature: FEATURE_STR }], []]);

    const res = await request(app)
      .get('/gti525/v1/pistes?populaireDebut=2022-01-01&populaireFin=2022-12-31');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('type', 'FeatureCollection');
  });

  it('devrait retourner 400 quand populaireDebut est fourni sans populaireFin', async () => {
    const res = await request(app).get('/gti525/v1/pistes?populaireDebut=2022-01-01');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('devrait retourner 400 quand populaireFin est fourni sans populaireDebut', async () => {
    const res = await request(app).get('/gti525/v1/pistes?populaireFin=2022-12-31');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('devrait retourner 400 quand populaireDebut est postérieur à populaireFin', async () => {
    const res = await request(app)
      .get('/gti525/v1/pistes?populaireDebut=2022-12-31&populaireFin=2022-01-01');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it("devrait retourner 500 avec un message d'erreur quand la base est inaccessible", async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/gti525/v1/pistes');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Database query failed.');
  });
});
