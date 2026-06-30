'use strict';

const request = require('supertest');
const fs = require('fs');
const { app } = require('../server');

const CSV_FIXTURE = [
  'ID,Arrondissement,Nom_parc_lieu,Proximité_jeux_repère,Intersection,Etat,Date_installation,Remarque,Precision_localisation,X,Y,Longitude,Latitude',
  '1,Rosemont,Parc Molson,Terrain de jeux,Rachel / Frontenac,Bon,2018-05-01,,GPS,-73.5488,45.5349,-73.5488,45.5349',
  '2,Plateau-Mont-Royal,Parc Lafontaine,Fontaine,Sherbrooke / Papineau,Bon,2019-07-15,,GPS,-73.5702,45.5221,-73.5702,45.5221',
].join('\n');

describe('Route GET /gti525/v1/pointsdinteret', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devrait retourner 200 avec un tableau non vide de points d\'intérêt', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(CSV_FIXTURE);

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('devrait retourner les champs attendus sur chaque point d\'intérêt', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(CSV_FIXTURE);

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    const poi = res.body[0];
    expect(poi).toHaveProperty('ID');
    expect(poi).toHaveProperty('Arrondissement');
    expect(poi).toHaveProperty('Nom_parc_lieu');
    expect(poi).toHaveProperty('Latitude');
    expect(poi).toHaveProperty('Longitude');
  });

  it('devrait retourner 500 avec un message d\'erreur quand le fichier CSV est inaccessible', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Failed to read the points of interest file.');
  });
});
