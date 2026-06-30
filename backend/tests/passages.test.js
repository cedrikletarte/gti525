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

describe('Route GET /gti525/v1/compteurs/:id/passages', () => {
  it('devrait retourner 200 avec les passages journaliers quand l\'id et les dates sont valides', async () => {
    setDb(makeDb([
      { jour: '2022-01-01', total_passages: 150 },
      { jour: '2022-01-02', total_passages: 200 },
    ]));

    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=220101&fin=220102');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('jour', '2022-01-01');
    expect(res.body[0]).toHaveProperty('total_passages', 150);
  });

  it('devrait retourner 200 sans paramètres de date quand le compteur a des données', async () => {
    setDb(makeDb([{ jour: '2022-06-15', total_passages: 320 }]));

    const res = await request(app).get('/gti525/v1/compteurs/1/passages');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('jour');
    expect(res.body[0]).toHaveProperty('total_passages');
  });

  it('devrait retourner 404 quand l\'identifiant ne correspond à aucun compteur', async () => {
    setDb(makeDb([]));

    const res = await request(app).get('/gti525/v1/compteurs/99999/passages');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('erreur', 'No data found for this counter in the requested period.');
  });

  it('devrait retourner 400 quand l\'identifiant de compteur est non numérique', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/abc/passages');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur', 'Invalid counter identifier.');
  });

  it('devrait retourner 400 quand seul le paramètre debut est fourni sans fin', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=220101');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur', 'Parameters debut and fin must be provided together (format YYMMDD).');
  });

  it('devrait retourner 400 quand seul le paramètre fin est fourni sans debut', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?fin=220131');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur', 'Parameters debut and fin must be provided together (format YYMMDD).');
  });

  it('devrait retourner 400 quand debut est postérieur à fin', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=221231&fin=220101');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur', 'Start date must be before or equal to end date.');
  });

  it('devrait retourner 400 quand le format de date de debut est invalide', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=abc123&fin=220131');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur', 'Invalid date format. Use YYMMDD (e.g. 220101).');
  });

  it('devrait retourner 400 quand le mois de debut est hors plage (ex. 13)', async () => {
    const res = await request(app).get('/gti525/v1/compteurs/1/passages?debut=221301&fin=221301');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur', 'Invalid date format. Use YYMMDD (e.g. 220101).');
  });
});
