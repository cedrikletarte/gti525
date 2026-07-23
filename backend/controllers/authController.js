import * as z from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UtilisateursModel from '../models/UtilisateursModel.js';
import { Reponse } from './util.js';

const credentialsSchema = z.object({
  courriel:   z.string().min(1),
  motDePasse: z.string().min(1),
});

export async function inscription(req, res) {
  const r = credentialsSchema.safeParse(req.body ?? {});
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, 'Courriel et mot de passe requis.'));
  }
  const { courriel, motDePasse } = r.data;

  try {
    const mdpHash = await bcrypt.hash(motDePasse, 10);
    await UtilisateursModel.creer(courriel, mdpHash);
    return res.status(201).json(Reponse.ok({ message: 'Compte créé.' }));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json(Reponse.erreur(409, 'Ce courriel est déjà utilisé.'));
    }
    return res.status(500).json(Reponse.erreur(500, 'Erreur serveur.'));
  }
}

export async function connexion(req, res) {
  const r = credentialsSchema.safeParse(req.body ?? {});
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, 'Courriel et mot de passe requis.'));
  }
  const { courriel, motDePasse } = r.data;

  try {
    const row = await UtilisateursModel.trouverParCourriel(courriel);

    if (!row || !(await bcrypt.compare(motDePasse, row.mdp_hash))) {
      return res.status(401).json(Reponse.erreur(401, 'Identifiants invalides.'));
    }

    const jeton = jwt.sign(
      { sub: row.id, courriel },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.status(200).json(Reponse.ok({ jeton }));
  } catch {
    return res.status(500).json(Reponse.erreur(500, 'Erreur serveur.'));
  }
}

export function moi(req, res) {
  return res.status(200).json(Reponse.ok({ utilisateur: { courriel: req.user.courriel } }));
}
