'use strict';
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { getDb } = require('../lib/db');

router.post('/inscription', async (req, res) => {
  const { courriel, motDePasse } = req.body ?? {};
  if (!courriel || !motDePasse) {
    return res.status(400).json({ erreur: 'Courriel et mot de passe requis.' });
  }
  try {
    const mdpHash = await bcrypt.hash(motDePasse, 10);
    const stmt = getDb().prepare('INSERT INTO utilisateurs (courriel, mdp_hash) VALUES (?, ?)');
    stmt.bind([courriel, mdpHash]);
    stmt.step();
    stmt.free();
    return res.status(201).json({ message: 'Compte créé.' });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ erreur: 'Ce courriel est déjà utilisé.' });
    }
    return res.status(500).json({ erreur: 'Erreur serveur.' });
  }
});

router.post('/connexion', async (req, res) => {
  const { courriel, motDePasse } = req.body ?? {};
  if (!courriel || !motDePasse) {
    return res.status(400).json({ erreur: 'Courriel et mot de passe requis.' });
  }
  try {
    const stmt = getDb().prepare('SELECT id, mdp_hash FROM utilisateurs WHERE courriel = ?');
    stmt.bind([courriel]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (!row || !(await bcrypt.compare(motDePasse, row.mdp_hash))) {
      return res.status(401).json({ erreur: 'Identifiants invalides.' });
    }

    const jeton = jwt.sign(
      { sub: row.id, courriel },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.status(200).json({ jeton });
  } catch {
    return res.status(500).json({ erreur: 'Erreur serveur.' });
  }
});

module.exports = router;
