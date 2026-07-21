'use strict';

// On isole la logique de la route : le LLM, le RAG et la base sont simulés pour
// ne dépendre ni d'une clé d'API ni d'un serveur MariaDB réel.
jest.mock('../lib/db', () => ({
  pool: { query: jest.fn() },
}));
jest.mock('../lib/llm', () => ({
  isConfigured: jest.fn(() => true),
  callLlm: jest.fn(async () => 'Réponse simulée du LLM.'),
}));
jest.mock('../lib/assistantContext', () => ({
  buildContext: jest.fn(async () => 'CONTEXTE simulé'),
}));

const request = require('supertest');
const { app } = require('../server');
const { isConfigured, callLlm } = require('../lib/llm');

beforeEach(() => {
  jest.clearAllMocks();
  isConfigured.mockReturnValue(true);
  callLlm.mockResolvedValue('Réponse simulée du LLM.');
});

describe('Route POST /gti525/v1/assistant', () => {
  it('devrait retourner 200 avec une réponse quand la question est valide', async () => {
    const res = await request(app).post('/gti525/v1/assistant').send({ question: 'Combien de compteurs ?' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reponse', 'Réponse simulée du LLM.');
    expect(callLlm).toHaveBeenCalledTimes(1);
  });

  it('devrait retourner 400 quand la question est absente', async () => {
    const res = await request(app).post('/gti525/v1/assistant').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur');
    expect(callLlm).not.toHaveBeenCalled();
  });

  it('devrait retourner 400 quand la question est vide', async () => {
    const res = await request(app).post('/gti525/v1/assistant').send({ question: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 400 quand la question dépasse 1000 caractères', async () => {
    const res = await request(app).post('/gti525/v1/assistant').send({ question: 'a'.repeat(1001) });

    expect(res.status).toBe(400);
    expect(res.body.erreur).toMatch(/1000/);
    expect(callLlm).not.toHaveBeenCalled();
  });

  it('devrait retourner 503 quand le service LLM n\'est pas configuré', async () => {
    isConfigured.mockReturnValue(false);

    const res = await request(app).post('/gti525/v1/assistant').send({ question: 'Bonjour' });

    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait retourner 502 quand l\'appel au LLM échoue', async () => {
    callLlm.mockRejectedValue(new Error('boom'));

    const res = await request(app).post('/gti525/v1/assistant').send({ question: 'Bonjour' });

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('erreur');
  });

  it('devrait finir par retourner 429 lorsque la limite de débit est dépassée', async () => {
    // Plafond par défaut : 15 requêtes / minute par IP. On en envoie davantage
    // depuis la même IP (supertest) pour déclencher la limitation.
    let seen429 = false;
    for (let i = 0; i < 20; i++) {
      const res = await request(app).post('/gti525/v1/assistant').send({ question: 'test' });
      if (res.status === 429) { seen429 = true; break; }
    }

    expect(seen429).toBe(true);
  });
});
