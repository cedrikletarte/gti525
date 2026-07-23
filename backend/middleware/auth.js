import jwt from 'jsonwebtoken';
import { Reponse } from '../controllers/util.js';

export default function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json(Reponse.erreur(401, 'Jeton manquant ou invalide.'));
  }
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json(Reponse.erreur(401, 'Jeton manquant ou invalide.'));
  }
}
