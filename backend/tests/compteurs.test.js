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
    reset: jest.fn(),
  };
  return { prepare: jest.fn(() => stmt) };
}

describe('Route GET /gti525/v1/compteurs', () => {
  it('devrait retourner 200 avec un objet paginé ayant les champs attendus', async () => {
    setDb(makeDb([
      { n: 2 },
      { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012, Arrondissement: null },
      { ID: '101', Nom: 'Rachel / Papineau',    Statut: 'Actif', Latitude: 45.5302, Longitude: -73.5688, Annee_implante: 2010, Arrondissement: null },
    ]));

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('donnees');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limite');
    expect(Array.isArray(res.body.donnees)).toBe(true);
  });

  it('devrait retourner les valeurs exactes des champs dans donnees', async () => {
    setDb(makeDb([
      { n: 1 },
      { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012, Arrondissement: null },
    ]));

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.body.donnees[0].ID).toBe('100');
    expect(res.body.donnees[0].Nom).toBe('Pont Jacques-Cartier');
    expect(res.body.donnees[0].Statut).toBe('Actif');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limite).toBe(20);
  });

  it('devrait retourner 500 avec un message d\'erreur quand la base est inaccessible', async () => {
    setDb({ prepare: () => { throw new Error('DB error'); } });

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Database query failed.');
  });
});

describe('Route GET /gti525/v1/compteurs/:id', () => {
  it('devrait retourner 200 avec le compteur demandé', async () => {
    setDb(makeDb([
      { ID: '100', Nom: 'Pont Jacques-Cartier', Statut: 'Actif', Latitude: 45.5236, Longitude: -73.5445, Annee_implante: 2012, Arrondissement: null },
    ]));

    const res = await request(app).get('/gti525/v1/compteurs/100');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ID', '100');
    expect(res.body).toHaveProperty('Nom', 'Pont Jacques-Cartier');
  });

  it('devrait retourner 404 si le compteur n\'existe pas', async () => {
    setDb(makeDb([]));

    const res = await request(app).get('/gti525/v1/compteurs/9999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('erreur', 'Compteur introuvable.');
  });

  it('devrait retourner 500 quand la base est inaccessible', async () => {
    setDb({ prepare: () => { throw new Error('DB error'); } });

    const res = await request(app).get('/gti525/v1/compteurs/100');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Database query failed.');
  });
});
