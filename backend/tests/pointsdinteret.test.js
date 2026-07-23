import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('../lib/db.js', () => ({
  pool: { query: mockQuery },
}));

const { default: request } = await import('supertest');
const { app } = await import('../server.js');
const { default: jwt } = await import('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET || 'test-secret';
const VALID_TOKEN = jwt.sign({ sub: 1, courriel: 'test@test.com' }, JWT_SECRET, { expiresIn: '1h' });

beforeEach(() => mockQuery.mockReset());

const POI_ROW = {
  ID: 1, Arrondissement: 'Rosemont', Nom_parc_lieu: 'Parc Molson',
  'Proximité_jeux_repère': 'Terrain de jeux', Intersection: 'Rachel / Frontenac',
  Etat: 'Bon', Date_installation: '2018-05-01', Remarque: '',
  Precision_localisation: 'GPS', X: -73.5488, Y: 45.5349, Longitude: -73.5488, Latitude: 45.5349,
  Type: 'Fontaine',
};

describe('Route GET /gti525/v1/pointsdinteret', () => {
  it('devrait retourner 200 avec un objet paginé non vide', async () => {
    mockQuery
      .mockResolvedValueOnce([[{ n: 1 }], []])
      .mockResolvedValueOnce([[POI_ROW], []]);

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('donnees');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('limite');
    expect(Array.isArray(res.body.data.donnees)).toBe(true);
    expect(res.body.data.donnees.length).toBeGreaterThan(0);
  });

  it("devrait retourner les champs attendus sur chaque point d'intérêt", async () => {
    mockQuery
      .mockResolvedValueOnce([[{ n: 1 }], []])
      .mockResolvedValueOnce([[POI_ROW], []]);

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    const poi = res.body.data.donnees[0];
    expect(poi).toHaveProperty('ID');
    expect(poi).toHaveProperty('Arrondissement');
    expect(poi).toHaveProperty('Nom_parc_lieu');
    expect(poi).toHaveProperty('Latitude');
    expect(poi).toHaveProperty('Longitude');
  });

  it("devrait retourner 500 avec un message d'erreur quand la base est inaccessible", async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/gti525/v1/pointsdinteret');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Database query failed.');
  });
});

describe('Route POST /gti525/v1/pointsdinteret', () => {
  it('devrait retourner 201 avec le point créé quand le corps est valide', async () => {
    mockQuery.mockResolvedValueOnce([{ insertId: 42 }, []]);

    const res = await request(app)
      .post('/gti525/v1/pointsdinteret')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'Parc Test', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id', 42);
    expect(res.body.data).toHaveProperty('nom_parc_lieu', 'Parc Test');
  });

  it('devrait retourner 400 quand des champs requis sont manquants', async () => {
    const res = await request(app)
      .post('/gti525/v1/pointsdinteret')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'Parc Test' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it("devrait retourner 401 sans jeton d'authentification", async () => {
    const res = await request(app)
      .post('/gti525/v1/pointsdinteret')
      .send({ nom_parc_lieu: 'Parc Test', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(401);
  });
});

describe('Route PUT /gti525/v1/pointsdinteret/:id', () => {
  it('devrait retourner 200 avec le point mis à jour', async () => {
    mockQuery
      .mockResolvedValueOnce([[{ id: 5 }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const res = await request(app)
      .put('/gti525/v1/pointsdinteret/5')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'Parc Modifié', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', 5);
    expect(res.body.data).toHaveProperty('nom_parc_lieu', 'Parc Modifié');
  });

  it("devrait retourner 404 si le point n'existe pas", async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .put('/gti525/v1/pointsdinteret/9999')
      .set('Authorization', `Bearer ${VALID_TOKEN}`)
      .send({ nom_parc_lieu: 'X', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it("devrait retourner 401 sans jeton d'authentification", async () => {
    const res = await request(app)
      .put('/gti525/v1/pointsdinteret/5')
      .send({ nom_parc_lieu: 'X', latitude: 45.5, longitude: -73.5 });

    expect(res.status).toBe(401);
  });
});

describe('Route DELETE /gti525/v1/pointsdinteret/:id', () => {
  it('devrait retourner 204 quand le point est supprimé', async () => {
    mockQuery
      .mockResolvedValueOnce([[{ id: 5 }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

    const res = await request(app)
      .delete('/gti525/v1/pointsdinteret/5')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(204);
  });

  it("devrait retourner 404 si le point n'existe pas", async () => {
    mockQuery.mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .delete('/gti525/v1/pointsdinteret/9999')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it("devrait retourner 401 sans jeton d'authentification", async () => {
    const res = await request(app)
      .delete('/gti525/v1/pointsdinteret/5');

    expect(res.status).toBe(401);
  });
});
