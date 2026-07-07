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

const POI_ROWS = [
  {
    ID: 1, Arrondissement: 'Rosemont', Nom_parc_lieu: 'Parc Molson',
    'Proximité_jeux_repère': 'Terrain de jeux', Intersection: 'Rachel / Frontenac',
    Etat: 'Bon', Date_installation: '2018-05-01', Remarque: '',
    Precision_localisation: 'GPS', X: -73.5488, Y: 45.5349, Longitude: -73.5488, Latitude: 45.5349,
  },
  {
    ID: 2, Arrondissement: 'Plateau-Mont-Royal', Nom_parc_lieu: 'Parc Lafontaine',
    'Proximité_jeux_repère': 'Fontaine', Intersection: 'Sherbrooke / Papineau',
    Etat: 'Bon', Date_installation: '2019-07-15', Remarque: '',
    Precision_localisation: 'GPS', X: -73.5702, Y: 45.5221, Longitude: -73.5702, Latitude: 45.5221,
  },
];

describe('Route GET /gti525/v1/pointsdinteret', () => {
  it('devrait retourner 200 avec un tableau non vide de points d\'intérêt', async () => {
    setDb(makeDb(POI_ROWS));

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('devrait retourner les champs attendus sur chaque point d\'intérêt', async () => {
    setDb(makeDb(POI_ROWS));

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    const poi = res.body[0];
    expect(poi).toHaveProperty('ID');
    expect(poi).toHaveProperty('Arrondissement');
    expect(poi).toHaveProperty('Nom_parc_lieu');
    expect(poi).toHaveProperty('Latitude');
    expect(poi).toHaveProperty('Longitude');
  });

  it('devrait retourner 500 avec un message d\'erreur quand la base est inaccessible', async () => {
    setDb({ prepare: () => { throw new Error('DB error'); } });

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('erreur', 'Database query failed.');
  });
});
