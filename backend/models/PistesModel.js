import { pool } from '../lib/db.js';

// Aucun code Express ici — un test unitaire pourrait l'utiliser sans démarrer
// de serveur.
class PistesModel {
  constructor(pool) {
    this.pool = pool;
  }

  async top3ArrondissementsPopulaires(debutIso, finIso) {
    const [rows] = await this.pool.query(`
      SELECT c.arrondissement,
             SUM(p.nb_passages)            AS total_passages,
             COUNT(DISTINCT p.id_compteur) AS n_compteurs
      FROM   passages p
      JOIN   compteurs c ON CAST(p.id_compteur AS CHAR) = c.id
      WHERE  DATE(p.date_heure) BETWEEN ? AND ?
      AND    c.arrondissement IS NOT NULL
      GROUP  BY c.arrondissement
      ORDER BY SUM(p.nb_passages) / COUNT(DISTINCT p.id_compteur) DESC
      LIMIT  3
    `, [debutIso, finIso]);
    return rows;
  }

  async listerFeatures({ arrondissement, saisons4, categorieSql, normArrIn } = {}) {
    const conditions = [];
    const params     = [];

    if (arrondissement) { conditions.push('nom_arr_ville_desc = ?'); params.push(arrondissement); }
    if (saisons4)        { conditions.push('saisons4 = ?');           params.push(saisons4); }
    if (categorieSql)    { conditions.push(categorieSql); }
    if (normArrIn && normArrIn.length) {
      conditions.push(`norm_arr IN (${normArrIn.map(() => '?').join(',')})`);
      params.push(...normArrIn);
    }

    let sql = 'SELECT feature FROM pistes';
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

    const [rows] = await this.pool.query(sql, params);
    return rows.map(r => JSON.parse(r.feature));
  }
}

export default new PistesModel(pool);
