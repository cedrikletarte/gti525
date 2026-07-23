import { pool } from '../lib/db.js';

// Aucun code Express ici — un test unitaire pourrait l'utiliser sans démarrer
// de serveur.
class PointsInteretModel {
  constructor(pool) {
    this.pool = pool;
  }

  async listerPagine({ nom, type, arrondissement, limite, offset }) {
    const conditions = [];
    const params     = [];

    if (nom)            { conditions.push('nom_parc_lieu LIKE ?'); params.push(`%${nom}%`); }
    if (type)           { conditions.push('type = ?');              params.push(type); }
    if (arrondissement) { conditions.push('arrondissement = ?');    params.push(arrondissement); }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const [[countRow]] = await this.pool.query(`SELECT COUNT(*) AS n FROM pointsdinteret${where}`, params);
    const total = countRow.n ?? 0;

    const [donnees] = await this.pool.query(
      `SELECT id AS ID, arrondissement AS Arrondissement,
              nom_parc_lieu AS Nom_parc_lieu,
              proximite_jeux_repere AS "Proximité_jeux_repère",
              intersection AS Intersection, etat AS Etat,
              date_installation AS Date_installation, remarque AS Remarque,
              precision_localisation AS Precision_localisation,
              x AS X, y AS Y, longitude AS Longitude, latitude AS Latitude,
              type AS Type
       FROM pointsdinteret${where} ORDER BY id LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );

    return { donnees, total };
  }

  async existe(id) {
    const [rows] = await this.pool.query('SELECT id FROM pointsdinteret WHERE id = ?', [id]);
    return Boolean(rows[0]);
  }

  async creer(champs) {
    const [result] = await this.pool.query(
      `INSERT INTO pointsdinteret
         (arrondissement, nom_parc_lieu, proximite_jeux_repere, intersection,
          etat, date_installation, remarque, precision_localisation,
          x, y, longitude, latitude, type)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        champs.arrondissement         ?? null,
        champs.nom_parc_lieu,
        champs.proximite_jeux_repere  ?? null,
        champs.intersection           ?? null,
        champs.etat                   ?? null,
        champs.date_installation      ?? null,
        champs.remarque               ?? null,
        champs.precision_localisation ?? null,
        champs.x   != null ? champs.x   : null,
        champs.y   != null ? champs.y   : null,
        champs.longitude,
        champs.latitude,
        champs.type ?? null,
      ]
    );
    return result.insertId;
  }

  async modifier(id, champs) {
    await this.pool.query(
      `UPDATE pointsdinteret SET
         arrondissement = ?, nom_parc_lieu = ?, proximite_jeux_repere = ?,
         intersection = ?, etat = ?, date_installation = ?, remarque = ?,
         precision_localisation = ?, x = ?, y = ?, longitude = ?, latitude = ?, type = ?
       WHERE id = ?`,
      [
        champs.arrondissement         ?? null,
        champs.nom_parc_lieu          ?? null,
        champs.proximite_jeux_repere  ?? null,
        champs.intersection           ?? null,
        champs.etat                   ?? null,
        champs.date_installation      ?? null,
        champs.remarque               ?? null,
        champs.precision_localisation ?? null,
        champs.x         != null ? champs.x         : null,
        champs.y         != null ? champs.y         : null,
        champs.longitude != null ? champs.longitude : null,
        champs.latitude  != null ? champs.latitude  : null,
        champs.type ?? null,
        id,
      ]
    );
  }

  async supprimer(id) {
    await this.pool.query('DELETE FROM pointsdinteret WHERE id = ?', [id]);
  }
}

export default new PointsInteretModel(pool);
