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

describe('Route GET /gti525/v1/compteurs', () => {
  it('devrait retourner 200 avec un tableau de compteurs ayant les champs attendus', async () => {
    setDb(makeDb([
      { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012 },
      { ID: '101', Nom: 'Rachel / Papineau',    Statut: 'Actif', Latitude: 45.5302, Longitude: -73.5688, Annee_implante: 2010 },
    ]));

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('ID');
    expect(res.body[0]).toHaveProperty('Nom');
    expect(res.body[0]).toHaveProperty('Statut');
    expect(res.body[0]).toHaveProperty('Latitude');
    expect(res.body[0]).toHaveProperty('Longitude');
    expect(res.body[0]).toHaveProperty('Annee_implante');
  });

  it('devrait retourner les valeurs exactes des champs', async () => {
    setDb(makeDb([
      { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012 },
    ]));

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.body[0].ID).toBe('100');
    expect(res.body[0].Nom).toBe('Pont Jacques-Cartier');
    expect(res.body[0].Statut).toBe('Actif');
  });

  it('devrait retourner 500 avec un message d\'erreur quand la base est inaccessible', async () => {
    setDb({ prepare: () => { throw new Error('DB error'); } });

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Database query failed.');
  });
});
