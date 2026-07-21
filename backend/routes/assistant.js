'use strict';
const router = require('express').Router();
const fs   = require('fs');
const path = require('path');
const { callLlm, isConfigured } = require('../lib/llm');
const { buildContext } = require('../lib/assistantContext');

const MAX_QUESTION_LEN = 1000;
const MAX_REPONSE_LEN  = 4000;

// Journal serveur des signalements de mauvaises réponses (T6.4).
const LOG_DIR          = path.join(__dirname, '..', 'logs');
const SIGNALEMENTS_LOG = path.join(LOG_DIR, 'signalements.log');

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

// Consigne un signalement dans un fichier journal serveur (une ligne JSON par
// événement). Le contenu signalé (question + réponse) est le contenu même de
// l'assistant, soumis volontairement par l'utilisateur pour révision.
function logSignalement(entry) {
  const ligne = JSON.stringify({ horodatage: new Date().toISOString(), ...entry }) + '\n';
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(SIGNALEMENTS_LOG, ligne);
  } catch { /* si l'écriture fichier échoue, le console.log ci-dessous reste le journal */ }
  console.log(`[assistant][signalement] ${ligne.trim()}`);
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
    const contexte = await buildContext(question);
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

// ─── Signalement d'une mauvaise réponse (T6.4) ──────────────────────────────
// L'utilisateur clique sur « Signaler » ; l'événement (question + réponse
// signalée) est consigné dans le journal serveur pour révision par l'équipe.
router.post('/signalement', (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'inconnue';
  if (rateLimited(ip)) {
    return res.status(429).json({ erreur: 'Trop de requêtes. Réessayez dans un instant.' });
  }

  const body = req.body ?? {};
  const question = typeof body.question === 'string' ? body.question.slice(0, MAX_QUESTION_LEN) : '';
  const reponse  = typeof body.reponse  === 'string' ? body.reponse.slice(0, MAX_REPONSE_LEN)   : '';

  if (!reponse) {
    return res.status(400).json({ erreur: 'La réponse signalée est requise.' });
  }

  logSignalement({ questionLen: question.length, reponseLen: reponse.length, question, reponse });
  return res.status(201).json({ message: 'Signalement enregistré. Merci de votre retour.' });
});

module.exports = router;
