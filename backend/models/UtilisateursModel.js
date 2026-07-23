import { pool } from '../lib/db.js';

// Aucun code Express ici — un test unitaire pourrait l'utiliser sans démarrer
// de serveur.
class UtilisateursModel {
  constructor(pool) {
    this.pool = pool;
  }

  async creer(courriel, mdpHash) {
    return this.pool.query(
      'INSERT INTO utilisateurs (courriel, mdp_hash) VALUES (?, ?)',
      [courriel, mdpHash]
    );
  }

  async trouverParCourriel(courriel) {
    const [rows] = await this.pool.query(
      'SELECT id, mdp_hash FROM utilisateurs WHERE courriel = ?',
      [courriel]
    );
    return rows[0] ?? null;
  }
}

export default new UtilisateursModel(pool);
