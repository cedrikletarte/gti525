import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../lib/db.js', () => ({
  pool: { query: mockQuery },
}));

const { default: request } = await import('supertest');
const { app } = await import('../server.js');

beforeEach(() => mockQuery.mockReset());

describe('Route GET /gti525/v1/compteurs/:id/passages', () => {
  it("devrait retourner 200 avec les passages journaliers quand l'id et les dates sont valides", async () => {
    mockQuery.mockResolvedValueOnce([[
      { jour: '2022-01-01', total_passages: 150 },
      { jour: '2022-01-02', total_passages: 200 },
    ], []]);

    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=2022-01-01&fin=2022-01-02');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]).toHaveProperty('jour', '2022-01-01');
    expect(res.body.data[0]).toHaveProperty('total_passages', 150);
  });

  it('devrait retourner 200 sans paramètres de date quand le compteur a des données', async () => {
    mockQuery.mockResolvedValueOnce([[
      { jour: '2022-06-15', total_passages: 320 },
    ], []]);

    const res = await request(app).get('/gti525/v1/compteurs/1/passages');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('jour');
    expect(res.body.data[0]).toHaveProperty('total_passages');
  });

  it('devrait retourner 200 avec la clé semaine pour intervalle=semaine', async () => {
    mockQuery.mockResolvedValueOnce([[
      { semaine: '2022-01', total_passages: 980 },
    ], []]);

    const res = await request(app).get('/gti525/v1/compteurs/1/passages?intervalle=semaine');

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('semaine');
    expect(res.body.data[0]).toHaveProperty('total_passages');
  });

  it('devrait retourner 200 avec la clé mois pour intervalle=mois', async () => {
    mockQuery.mockResolvedValueOnce([[
      { mois: '2022-01', total_passages: 4500 },
    ], []]);

    const res = await request(app).get('/gti525/v1/compteurs/1/passages?intervalle=mois');

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('mois');
    expect(res.body.data[0]).toHaveProperty('total_passages');
  });

  it('devrait retourner 400 pour un intervalle invalide', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?intervalle=annee');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Intervalle invalide. Valeurs acceptées : jour, semaine, mois.');
  });

  it("devrait retourner 404 quand l'identifiant ne correspond à aucun compteur", async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const res = await request(app).get('/gti525/v1/compteurs/99999/passages');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'No data found for this counter in the requested period.');
  });

  it("devrait retourner 400 quand l'identifiant de compteur est non numérique", async () => {
    const res = await request(app).get('/gti525/v1/compteurs/abc/passages');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid counter identifier.');
  });

  it('devrait retourner 400 quand seul le paramètre debut est fourni sans fin', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=2022-01-01');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Les paramètres debut et fin doivent être fournis ensemble (format YYYY-MM-DD).');
  });

  it('devrait retourner 400 quand seul le paramètre fin est fourni sans debut', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?fin=2022-01-31');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Les paramètres debut et fin doivent être fournis ensemble (format YYYY-MM-DD).');
  });

  it('devrait retourner 400 quand debut est postérieur à fin', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=2022-12-31&fin=2022-01-01');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'La date de début doit être antérieure ou égale à la date de fin.');
  });

  it('devrait retourner 400 quand le format de date est invalide', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=abc&fin=2022-01-31');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Format de date invalide. Utilisez YYYY-MM-DD (ex. 2022-01-01).');
  });

  it('devrait retourner 400 quand le mois est hors plage (ex. 13)', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=2022-13-01&fin=2022-13-01');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Format de date invalide. Utilisez YYYY-MM-DD (ex. 2022-01-01).');
  });
});
