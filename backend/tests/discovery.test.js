const { default: request } = await import('supertest');
const { app } = await import('../server.js');

describe('Route GET /gti525/v1/', () => {
  it('devrait lister les points de terminaison réellement montés', async () => {
    const res = await request(app).get('/gti525/v1/');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.endpoints)).toBe(true);

    const chemins = res.body.data.endpoints.map((e) => `${e.methode} ${e.chemin}`);
    expect(chemins).toContain('GET /gti525/v1/');
    expect(chemins).toContain('GET /gti525/v1/pointsdinteret');
    expect(chemins).toContain('POST /gti525/v1/pointsdinteret');
    expect(chemins).toContain('GET /gti525/v1/compteurs/:id/passages');
  });

  it('devrait inclure la description issue des métadonnées', async () => {
    const res = await request(app).get('/gti525/v1/');

    const pointsdinteret = res.body.data.endpoints.find(
      (e) => e.methode === 'GET' && e.chemin === '/gti525/v1/pointsdinteret'
    );
    expect(pointsdinteret.description).toBe("Liste paginée des points d'intérêt");
  });
});
