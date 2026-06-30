'use strict';

const request = require('supertest');
const fs = require('fs');
const { app } = require('../server');

const CSV_FIXTURE = [
  'ID,Nom,Statut,Latitude,Longitude,Annee_implante',
  '100,Pont Jacques-Cartier,Actif,45.5236,-73.5445,2012',
  '101,Rachel / Papineau,Actif,45.5302,-73.5688,2010',
].join('\n');

describe('Route GET /gti525/v1/compteurs', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devrait retourner 200 avec un tableau de compteurs ayant les champs attendus', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(CSV_FIXTURE);

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

  it('devrait retourner les valeurs exactes des champs parsés depuis le CSV', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(CSV_FIXTURE);

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.body[0].ID).toBe('100');
    expect(res.body[0].Nom).toBe('Pont Jacques-Cartier');
    expect(res.body[0].Statut).toBe('Actif');
  });

  it('devrait retourner 500 avec un message d\'erreur quand le fichier CSV est inaccessible', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    const res = await request(app).get('/gti525/v1/compteurs');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Failed to read the counter list.');
  });
});
