'use strict';

// RAG simple : à partir de la question, on rassemble un contexte factuel issu
// de la base MariaDB. Ce contexte est injecté dans le prompt du LLM pour qu'il
// réponde à partir de données réelles plutôt que de son savoir général.
//
// Familles de questions couvertes (T6.3) :
//   1. Statistiques de passages sur une période
//   2. Recherche d'un point d'intérêt par (proximité d')arrondissement
//   3. Informations sur les pistes (longueur, catégorie) dans un arrondissement
//   4. Identification de la piste/du secteur le plus achalandé
//   5. Comparaison entre deux périodes ou deux arrondissements

const { pool } = require('./db');
const { normArr, CATEGORIE_SQL } = require('./geo');

const MAX_CONTEXT_CHARS = 6000;

const CATEGORIE_LABELS = {
  rev:               'REV (Réseau Express Vélo)',
  voiePartagee:      'voie partagée',
  voieProtegee:      'voie protégée',
  sentierPolyvalent: 'sentier polyvalent',
};

const MOIS = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11,
  décembre: 12, decembre: 12,
};

// ─── Petits utilitaires SQL (MariaDB / mysql2 promise) ──────────────────────
async function all(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Retourne la première valeur de la première ligne (pour les COUNT/SUM/MIN...).
async function scalar(sql, params = []) {
  const rows = await all(sql, params);
  if (!rows.length) return null;
  return Object.values(rows[0])[0];
}

function has(qn, ...mots) {
  return mots.some((m) => qn.includes(m));
}

// ─── Détection dans la question ─────────────────────────────────────────────

// Tous les arrondissements mentionnés (NOM canonique du territoire), dédupliqués.
async function detectArrondissements(qn) {
  const territoires = await all('SELECT nom FROM territoires ORDER BY nom');
  const found = [];
  for (const t of territoires) {
    const n = normArr(t.nom);
    if (n && qn.includes(n) && !found.includes(t.nom)) found.push(t.nom);
  }
  return found;
}

function pad(n) { return String(n).padStart(2, '0'); }
function dernierJour(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }

// Jusqu'à 2 périodes {label, debut, fin} au format YYYY-MM-DD. Reconnaît les
// dates ISO, les couples « mois année » et les années seules.
function detectPeriodes(question) {
  const q = question.toLowerCase();
  const periodes = [];

  const isoDates  = [...question.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)].map((m) => m[0]);
  const moisAnnee = [...q.matchAll(/(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(\d{4})/g)];
  const annees    = [...q.matchAll(/\b(20\d{2})\b/g)].map((m) => m[1]);

  if (isoDates.length >= 2) {
    const [a, b] = [isoDates[0], isoDates[1]].sort();
    periodes.push({ label: `du ${a} au ${b}`, debut: a, fin: b });
    if (isoDates.length >= 4) {
      const [c, d] = [isoDates[2], isoDates[3]].sort();
      periodes.push({ label: `du ${c} au ${d}`, debut: c, fin: d });
    }
  } else if (moisAnnee.length) {
    for (const m of moisAnnee.slice(0, 2)) {
      const mo = MOIS[m[1]];
      const y  = parseInt(m[2], 10);
      periodes.push({ label: `${m[1]} ${y}`, debut: `${y}-${pad(mo)}-01`, fin: `${y}-${pad(mo)}-${pad(dernierJour(y, mo))}` });
    }
  } else if (isoDates.length === 1) {
    periodes.push({ label: `le ${isoDates[0]}`, debut: isoDates[0], fin: isoDates[0] });
  } else if (annees.length) {
    for (const y of [...new Set(annees)].slice(0, 2)) {
      periodes.push({ label: `année ${y}`, debut: `${y}-01-01`, fin: `${y}-12-31` });
    }
  }
  return periodes;
}

// ─── Requêtes par famille ───────────────────────────────────────────────────

// Somme de passages sur une période (réseau entier, ou un arrondissement donné).
async function passagesPeriode(periode, arrNom) {
  if (arrNom) {
    return (await scalar(
      `SELECT SUM(pa.nb_passages) AS total FROM passages pa
         JOIN compteurs c ON CAST(pa.id_compteur AS CHAR) = c.id
        WHERE c.arrondissement = ? AND DATE(pa.date_heure) BETWEEN ? AND ?`,
      [arrNom, periode.debut, periode.fin])) || 0;
  }
  return (await scalar(
    `SELECT SUM(nb_passages) AS total FROM passages
      WHERE DATE(date_heure) BETWEEN ? AND ?`,
    [periode.debut, periode.fin])) || 0;
}

async function topCompteurs(periode) {
  const where  = periode ? 'WHERE DATE(pa.date_heure) BETWEEN ? AND ?' : '';
  const params = periode ? [periode.debut, periode.fin] : [];
  return all(
    `SELECT c.nom AS nom, c.arrondissement AS arr, SUM(pa.nb_passages) AS total
       FROM passages pa JOIN compteurs c ON CAST(pa.id_compteur AS CHAR) = c.id
       ${where}
      GROUP BY pa.id_compteur ORDER BY total DESC LIMIT 5`,
    params);
}

// Pistes d'un arrondissement : nombre, longueur totale (km) et répartition par
// catégorie. LONGUEUR est en mètres dans les données → division par 1000.
async function pistesInfo(territoireNom) {
  const nn = normArr(territoireNom);
  const rows = await all('SELECT feature FROM pistes WHERE norm_arr = ?', [nn]);
  let metres = 0;
  for (const r of rows) {
    try {
      const f = JSON.parse(r.feature);
      metres += (f.properties && f.properties.LONGUEUR) || 0;
    } catch { /* feature illisible : ignorée */ }
  }
  const cats = {};
  for (const [key, cond] of Object.entries(CATEGORIE_SQL)) {
    cats[key] = (await scalar(`SELECT COUNT(*) AS n FROM pistes WHERE norm_arr = ? AND ${cond}`, [nn])) || 0;
  }
  return { count: rows.length, km: metres / 1000, cats };
}

// Retrouve la valeur exacte d'arrondissement utilisée dans pointsdinteret
// (orthographe différente des territoires) via comparaison normalisée.
async function resolvePoiArr(territoireNom) {
  const target = normArr(territoireNom);
  const rows = await all('SELECT DISTINCT arrondissement FROM pointsdinteret WHERE arrondissement IS NOT NULL');
  const match = rows.find((r) => normArr(r.arrondissement) === target);
  return match ? match.arrondissement : null;
}

// ─── Construction du contexte ───────────────────────────────────────────────
async function buildContext(question) {
  const qn = normArr(question);
  const parts = [];

  // 1. Résumé global — toujours inclus.
  const nbCompteurs = (await scalar('SELECT COUNT(*) AS n FROM compteurs')) || 0;
  const nbFontaines = (await scalar('SELECT COUNT(*) AS n FROM pointsdinteret')) || 0;
  const nbPistes    = (await scalar('SELECT COUNT(*) AS n FROM pistes')) || 0;
  const arrs  = (await all('SELECT nom FROM territoires ORDER BY nom')).map((r) => r.nom);
  const plage = (await all("SELECT DATE_FORMAT(MIN(date_heure), '%Y-%m-%d') AS min, DATE_FORMAT(MAX(date_heure), '%Y-%m-%d') AS max FROM passages"))[0] || {};

  parts.push(
    `RÉSUMÉ DU RÉSEAU :\n` +
    `- Compteurs vélo : ${nbCompteurs}\n` +
    `- Points d'intérêt (fontaines d'eau) : ${nbFontaines}\n` +
    `- Segments de pistes cyclables : ${nbPistes}\n` +
    `- Données de passages disponibles : ${plage.min || '?'} à ${plage.max || '?'}\n` +
    `- Arrondissements couverts (${arrs.length}) : ${arrs.join(', ')}`
  );

  const arrsDetectes = await detectArrondissements(qn);
  const periodes     = detectPeriodes(question);

  // 2. Infos par arrondissement (compteurs + pistes : longueur & catégories).
  //    Couvre les familles « pistes dans un arrondissement » et la comparaison
  //    entre deux arrondissements (jusqu'à 2 blocs).
  for (const arr of arrsDetectes.slice(0, 2)) {
    const nbCptArr = (await scalar('SELECT COUNT(*) AS n FROM compteurs WHERE arrondissement = ?', [arr])) || 0;
    const pi = await pistesInfo(arr);
    const repartition = Object.entries(pi.cats)
      .map(([k, n]) => `${CATEGORIE_LABELS[k]} : ${n}`)
      .join(', ');
    parts.push(
      `ARRONDISSEMENT « ${arr} » :\n` +
      `- Compteurs vélo : ${nbCptArr}\n` +
      `- Pistes cyclables : ${pi.count} segments, ${pi.km.toFixed(1)} km au total\n` +
      `- Répartition des pistes par catégorie : ${repartition}`
    );
  }

  // 3. Statistiques de passages sur une (ou deux) période(s).
  //    Couvre « passages sur une période » et « comparaison de deux périodes ».
  if (periodes.length) {
    for (const p of periodes) {
      const totalGlobal = await passagesPeriode(p, null);
      let bloc = `PASSAGES (${p.label}) :\n- Total réseau : ${totalGlobal} passages`;
      for (const arr of arrsDetectes.slice(0, 2)) {
        bloc += `\n- ${arr} : ${await passagesPeriode(p, arr)} passages`;
      }
      const top = await topCompteurs(p);
      if (top.length && top[0].total != null) {
        bloc += '\n- Compteurs les plus fréquentés sur la période :\n' +
          top.map((r, i) => `  ${i + 1}. ${r.nom} (${r.arr || 'arr. inconnu'}) — ${r.total} passages`).join('\n');
      }
      parts.push(bloc);
    }
  }

  // 4. Piste/secteur le plus achalandé (tout l'historique) — si aucune période
  //    précise n'a déjà été traitée. L'achalandage se mesure via les compteurs.
  if (!periodes.length && has(qn, 'compteur', 'passage', 'populaire', 'frequent', 'achaland', 'trafic')) {
    const top = await topCompteurs(null);
    if (top.length && top[0].total != null) {
      parts.push(
        `SECTEURS LES PLUS ACHALANDÉS (total de passages, tout l'historique) :\n` +
        top.map((r, i) => `${i + 1}. ${r.nom} (${r.arr || 'arr. inconnu'}) — ${r.total} passages`).join('\n') +
        `\nNOTE : l'achalandage est mesuré par les compteurs ; les pistes n'ont pas de comptage individuel dans les données.`
      );
    }
  }

  // 5. Points d'intérêt (fontaines) par arrondissement / proximité.
  if (has(qn, 'fontaine', 'eau', 'boire', 'point', 'interet', 'parc', 'lieu')) {
    const arr = arrsDetectes[0];
    const poiArr = arr ? await resolvePoiArr(arr) : null;
    const rows = poiArr
      ? await all('SELECT nom_parc_lieu, arrondissement, intersection FROM pointsdinteret WHERE arrondissement = ? LIMIT 10', [poiArr])
      : await all('SELECT nom_parc_lieu, arrondissement, intersection FROM pointsdinteret WHERE nom_parc_lieu IS NOT NULL LIMIT 8');

    if (rows.length) {
      const titre = poiArr ? `POINTS D'INTÉRÊT DANS « ${arr} »` : `POINTS D'INTÉRÊT (échantillon)`;
      parts.push(
        `${titre} :\n` +
        rows.map((r) => `- ${r.nom_parc_lieu || 'Sans nom'} — ${r.arrondissement || 'arr. inconnu'}${r.intersection ? ` (${r.intersection})` : ''}`).join('\n')
      );
    } else if (arr) {
      parts.push(`POINTS D'INTÉRÊT DANS « ${arr} » : aucun point d'intérêt recensé dans les données pour cet arrondissement.`);
    }
  }

  const context = parts.join('\n\n');
  return context.length > MAX_CONTEXT_CHARS ? context.slice(0, MAX_CONTEXT_CHARS) : context;
}

module.exports = { buildContext };
