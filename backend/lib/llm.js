'use strict';

// Appel à un LLM externe, côté serveur uniquement.
// La clé d'API provient de process.env et n'est JAMAIS renvoyée à la frontale.
//
// Trois fournisseurs offrant un palier gratuit sont supportés, choisis via
// la variable d'environnement LLM_PROVIDER :
//   - gemini  : Google AI Studio (aistudio.google.com) — gratuit, sans carte
//   - groq    : console.groq.com — gratuit, compatible OpenAI, très rapide
//   - mistral : console.mistral.ai — palier gratuit, compatible OpenAI
//
// Configuration (backend/.env) :
//   LLM_PROVIDER=gemini|groq|mistral
//   LLM_API_KEY=...
//   LLM_MODEL=...            (optionnel, défaut raisonnable par fournisseur)

const DEFAULT_MODELS = {
  gemini:  'gemini-2.0-flash',
  groq:    'llama-3.1-8b-instant',
  mistral: 'mistral-small-latest',
};

// Fournisseurs compatibles avec le format « chat completions » d'OpenAI.
const OPENAI_COMPATIBLE = {
  groq:    'https://api.groq.com/openai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
};

const TIMEOUT_MS = 20000;

function getConfig() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const apiKey   = process.env.LLM_API_KEY;
  const model    = process.env.LLM_MODEL || DEFAULT_MODELS[provider];
  return { provider, apiKey, model };
}

// Indique si le service est configuré (clé + fournisseur connu).
function isConfigured() {
  const { provider, apiKey } = getConfig();
  return Boolean(apiKey) && (provider === 'gemini' || provider in OPENAI_COMPATIBLE);
}

async function callOpenAiCompatible(url, { apiKey, model, system, user }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`LLM HTTP ${res.status} — ${detail.slice(0, 300)}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Réponse LLM vide');
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini({ apiKey, model, system, user }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`LLM HTTP ${res.status} — ${detail.slice(0, 300)}`);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Réponse LLM vide');
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

// Compose l'appel au fournisseur configuré. Lève une erreur si non configuré
// ou en cas d'échec réseau/API.
async function callLlm({ system, user }) {
  const { provider, apiKey, model } = getConfig();
  if (!apiKey) throw new Error('LLM_API_KEY manquant');

  if (provider === 'gemini') {
    return callGemini({ apiKey, model, system, user });
  }
  if (provider in OPENAI_COMPATIBLE) {
    return callOpenAiCompatible(OPENAI_COMPATIBLE[provider], { apiKey, model, system, user });
  }
  throw new Error(`Fournisseur LLM inconnu : ${provider}`);
}

module.exports = { callLlm, isConfigured };
