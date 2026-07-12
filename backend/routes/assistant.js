'use strict';
const router = require('express').Router();
const { getDb } = require('../lib/db');
const { callLlm, isConfigured } = require('../lib/llm');
const { buildContext } = require('../lib/assistantContext');

const MAX_QUESTION_LEN = 1000;

// ─── Limitation de débit simple, en mémoire, par adresse IP ─────────────────
const RATE_MAX       = parseInt(process.env.ASSISTANT_RATE_MAX, 10) || 15;   // requêtes
const RATE_WINDOW_MS = parseInt(process.env.ASSISTANT_RATE_WINDOW_MS, 10) || 60000; // par minute
const hits = new Map(); // ip -> tableau d'horodatages (ms)

function rateLimited(ip) {
  const now = self_now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

// Isolé pour faciliter les tests / la lisibilité.
function self_now() { return Date.now(); }

// ─── Journalisation sans données personnelles ───────────────────────────────
// On journalise uniquement : horodatage, longueur de la question, temps de
// réponse et présence d'erreur. Jamais la question, l'IP ou la réponse.
function logAppel({ questionLen, dureeMs, erreur }) {
  console.log(`[assistant] ${new Date().toISOString()} len=${questionLen} ms=${dureeMs} erreur=${erreur}`);
}

// ─── Prompt système ─────────────────────────────────────────────────────────
const SYSTEME = [
  "Tu es l'assistant de MTL Vélo, une application sur le réseau cyclable de la Ville de Montréal.",
  'Réponds en français, de façon concise, polie et factuelle.',
  "Fonde ta réponse UNIQUEMENT sur les données fournies dans la section CONTEXTE.",
  "Si l'information demandée ne figure pas dans le CONTEXTE, dis simplement que tu ne disposes pas de cette donnée.",
  "N'invente aucun chiffre ni aucun nom. N'utilise pas de mise en forme Markdown.",
].join(' ');

router.post('/', async (req, res) => {
  const debut = self_now();
  const ip = req.ip || req.socket?.remoteAddress || 'inconnue';

  // 1. Limitation de débit.
  if (rateLimited(ip)) {
    logAppel({ questionLen: 0, dureeMs: self_now() - debut, erreur: true });
    return res.status(429).json({ erreur: 'Trop de requêtes. Réessayez dans un instant.' });
  }

  // 2. Validation de la question.
  const question = (req.body ?? {}).question;
  if (typeof question !== 'string' || question.trim().length === 0) {
    logAppel({ questionLen: 0, dureeMs: self_now() - debut, erreur: true });
    return res.status(400).json({ erreur: 'Le champ « question » est requis.' });
  }
  if (question.length > MAX_QUESTION_LEN) {
    logAppel({ questionLen: question.length, dureeMs: self_now() - debut, erreur: true });
    return res.status(400).json({ erreur: `La question dépasse la limite de ${MAX_QUESTION_LEN} caractères.` });
  }

  // 3. Service configuré ?
  if (!isConfigured()) {
    logAppel({ questionLen: question.length, dureeMs: self_now() - debut, erreur: true });
    return res.status(503).json({ erreur: "L'assistant n'est pas configuré sur le serveur (clé d'API manquante)." });
  }

  // 4. RAG + appel LLM.
  try {
    const contexte = buildContext(getDb(), question);
    const userPrompt = `CONTEXTE :\n${contexte}\n\nQUESTION :\n${question}`;
    const reponse = await callLlm({ system: SYSTEME, user: userPrompt });

    logAppel({ questionLen: question.length, dureeMs: self_now() - debut, erreur: false });
    return res.json({ reponse });
  } catch (err) {
    logAppel({ questionLen: question.length, dureeMs: self_now() - debut, erreur: true });
    console.error('[assistant] échec LLM :', err.message); // diagnostic serveur (pas de données personnelles)
    return res.status(502).json({ erreur: "L'assistant est momentanément indisponible. Réessayez plus tard." });
  }
});

module.exports = router;
