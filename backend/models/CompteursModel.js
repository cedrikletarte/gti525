import { pool } from '../lib/db.js';

const INTERVALLES = {
  jour:    { select: "DATE(date_heure) AS jour",                                               group: "DATE(date_heure)" },
  semaine: { select: "CONCAT(YEAR(date_heure),'-',LPAD(WEEK(date_heure,3),2,'0')) AS semaine",   group: "YEARWEEK(date_heure,3)" },
  mois:    { select: "DATE_FORMAT(date_heure, '%Y-%m') AS mois",                                 group: "DATE_FORMAT(date_heure, '%Y-%m')" },
};

// Aucun code Express ici — un test unitaire pourrait l'utiliser sans démarrer
// de serveur.
class CompteursModel {
  constructor(pool) {
    this.pool = pool;
  }

  async listerPagine({ nom, statut, arrondissement, implantation, limite, offset }) {
    const conditions = [];
    const params     = [];

    if (nom)            { conditions.push('nom LIKE ?');         params.push(`%${nom}%`); }
    if (statut)         { conditions.push('statut = ?');          params.push(statut); }
    if (arrondissement) { conditions.push('arrondissement = ?');  params.push(arrondissement); }
    if (implantation != null) { conditions.push('annee_implante >= ?'); params.push(implantation); }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const [[countRow]] = await this.pool.query(`SELECT COUNT(*) AS n FROM compteurs${where}`, params);
    const total = countRow.n ?? 0;

    const [donnees] = await this.pool.query(
      `SELECT id AS ID, nom AS Nom, statut AS Statut,
              latitude AS Latitude, longitude AS Longitude,
              annee_implante AS Annee_implante, arrondissement AS Arrondissement
       FROM compteurs${where} ORDER BY id LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );

    return { donnees, total };
  }

  async obtenirParId(id) {
    const [rows] = await this.pool.query(
      `SELECT id AS ID, nom AS Nom, statut AS Statut,
              latitude AS Latitude, longitude AS Longitude,
              annee_implante AS Annee_implante, arrondissement AS Arrondissement
       FROM compteurs WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  async obtenirPassagesAgreges(id, { intervalle = 'jour', debutIso, finIso }) {
    const { select, group } = INTERVALLES[intervalle];
    let sql;
    let params;

    if (debutIso && finIso) {
      sql    = `SELECT ${select}, SUM(nb_passages) AS total_passages
                FROM passages
                WHERE id_compteur = ? AND DATE(date_heure) BETWEEN ? AND ?
                GROUP BY ${group} ORDER BY ${group}`;
      params = [parseInt(id, 10), debutIso, finIso];
    } else {
      sql    = `SELECT ${select}, SUM(nb_passages) AS total_passages
                FROM passages
                WHERE id_compteur = ?
                GROUP BY ${group} ORDER BY ${group}`;
      params = [parseInt(id, 10)];
    }

    const [rows] = await this.pool.query(sql, params);
    return rows;
  }
}

export default new CompteursModel(pool);
export { INTERVALLES };
