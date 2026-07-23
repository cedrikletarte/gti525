import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../lib/db.js', () => ({
  pool: { query: mockQuery },
}));

const { default: request } = await import('supertest');
const { app } = await import('../server.js');

beforeEach(() => mockQuery.mockReset());

describe('Route GET /gti525/v1/compteurs', () => {
  it('devrait retourner 200 avec un objet paginé ayant les champs attendus', async () => {
    mockQuery
      .mockResolvedValueOnce([[{ n: 2 }], []])
      .mockResolvedValueOnce([[
        { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012, Arrondissement: null },
        { ID: '101', Nom: 'Rachel / Papineau',    Statut: 'Actif', Latitude: 45.5302, Longitude: -73.5688, Annee_implante: 2010, Arrondissement: null },
      ], []]);

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('message', 'OK');
    expect(res.body.data).toHaveProperty('donnees');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('limite');
    expect(Array.isArray(res.body.data.donnees)).toBe(true);
  });

  it('devrait retourner les valeurs exactes des champs dans donnees', async () => {
    mockQuery
      .mockResolvedValueOnce([[{ n: 1 }], []])
      .mockResolvedValueOnce([[
        { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012, Arrondissement: null },
      ], []]);

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.body.data.donnees[0].ID).toBe('100');
    expect(res.body.data.donnees[0].Nom).toBe('Pont Jacques-Cartier');
    expect(res.body.data.donnees[0].Statut).toBe('Actif');
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limite).toBe(20);
  });

  it("devrait retourner 500 avec un message d'erreur quand la base est inaccessible", async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('code', 500);
    expect(res.body).toHaveProperty('message', 'Database query failed.');
  });
});

describe('Route GET /gti525/v1/compteurs/:id', () => {
  it('devrait retourner 200 avec le compteur demandé', async () => {
    mockQuery.mockResolvedValueOnce([[
      { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012, Arrondissement: null },
    ], []]);

    const res = await request(app).get('/gti525/v1/compteurs/100');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('ID', '100');
    expect(res.body.data).toHaveProperty('Nom', 'Pont Jacques-Cartier');
  });

  it("devrait retourner 404 si le compteur n'existe pas", async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const res = await request(app).get('/gti525/v1/compteurs/9999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Compteur introuvable.');
  });

  it('devrait retourner 500 quand la base est inaccessible', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/gti525/v1/compteurs/100');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Database query failed.');
  });
});
