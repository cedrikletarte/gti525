import { pool } from '../lib/db.js';

// Aucun code Express ici — un test unitaire pourrait l'utiliser sans démarrer
// de serveur.
class TerritoiresModel {
  constructor(pool) {
    this.pool = pool;
  }

  async listerFeatures() {
    const [rows] = await this.pool.query('SELECT feature FROM territoires');
    return rows.map(r => JSON.parse(r.feature));
  }
}

export default new TerritoiresModel(pool);
