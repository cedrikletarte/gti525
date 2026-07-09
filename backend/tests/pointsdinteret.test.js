'use strict';

const request = require('supertest');
const { app, setDb } = require('../server');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const jwt = require('jsonwebtoken');
const VALID_TOKEN = jwt.sign({ sub: 1, courriel: 'test@test.com' }, JWT_SECRET, { expiresIn: '1h' });

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

const POI_ROW = {
  ID: 1, Arrondissement: 'Rosemont', Nom_parc_lieu: 'Parc Molson',
  'Proximité_jeux_repère': 'Terrain de jeux', Intersection: 'Rachel / Frontenac',
  Etat: 'Bon', Date_installation: '2018-05-01', Remarque: '',
  Precision_localisation: 'GPS', X: -73.5488, Y: 45.5349, Longitude: -73.5488, Latitude: 45.5349,
  Type: 'Fontaine',
};

describe('Route GET /gti525/v1/pointsdinteret', () => {
  it('devrait retourner 200 avec un objet paginé non vide', async () => {
    setDb(makeDb([{ n: 1 }, POI_ROW]));

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('donnees');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limite');
    expect(Array.isArray(res.body.donnees)).toBe(true);
    expect(res.body.donnees.length).toBeGreaterThan(0);
  });

  it('devrait retourner les champs attendus sur chaque point d\'intérêt', async () => {
    setDb(makeDb([{ n: 1 }, POI_ROW]));

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    const poi = res.body.donnees[0];
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

describe('Route POST /gti525/v1/pointsdinteret', () => {
  it('devrait retourner 201 avec le point créé quand le corps est valide', async () => {
    setDb(makeDb([{ id: 42 }]));

    const res = await request(app)
      .post('/gti525/v1/pointsdinteret')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'Parc Test', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 42);
    expect(res.body).toHaveProperty('nom_parc_lieu', 'Parc Test');
  });

  it('devrait retourner 400 quand des champs requis sont manquants', async () => {
    const res = await request(app)
      .post('/gti525/v1/pointsdinteret')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'Parc Test' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 401 sans jeton d\'authentification', async () => {
    const res = await request(app)
      .post('/gti525/v1/pointsdinteret')
      .send({ nom_parc_lieu: 'Parc Test', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(401);
  });
});

describe('Route PUT /gti525/v1/pointsdinteret/:id', () => {
  it('devrait retourner 200 avec le point mis à jour', async () => {
    setDb(makeDb([{ id: '5' }]));

    const res = await request(app)
      .put('/gti525/v1/pointsdinteret/5')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'Parc Modifié', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 5);
    expect(res.body).toHaveProperty('nom_parc_lieu', 'Parc Modifié');
  });

  it('devrait retourner 404 si le point n\'existe pas', async () => {
    setDb(makeDb([]));

    const res = await request(app)
      .put('/gti525/v1/pointsdinteret/9999')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'X', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 401 sans jeton d\'authentification', async () => {
    const res = await request(app)
      .put('/gti525/v1/pointsdinteret/5')
      .send({ nom_parc_lieu: 'X', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(401);
  });
});

describe('Route DELETE /gti525/v1/pointsdinteret/:id', () => {
  it('devrait retourner 204 quand le point est supprimé', async () => {
    setDb(makeDb([{ id: '5' }]));

    const res = await request(app)
      .delete('/gti525/v1/pointsdinteret/5')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(204);
  });

  it('devrait retourner 404 si le point n\'existe pas', async () => {
    setDb(makeDb([]));

    const res = await request(app)
      .delete('/gti525/v1/pointsdinteret/9999')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 401 sans jeton d\'authentification', async () => {
    const res = await request(app)
      .delete('/gti525/v1/pointsdinteret/5');

    expect(res.status).toBe(401);
  });
});
