'use strict';

// RAG simple : à partir de la question, on rassemble un contexte factuel issu
// de la base SQLite. Ce contexte est injecté dans le prompt du LLM pour qu'il
// réponde à partir de données réelles plutôt que de son savoir général.

const { normArr } = require('./geo');

const MAX_CONTEXT_CHARS = 4000;

// Petit utilitaire : exécute une requête et retourne toutes les lignes.
function all(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function count(db, sql) {
  const rows = all(db, sql);
  return rows.length ? (rows[0].n ?? 0) : 0;
}

// Détecte le premier arrondissement mentionné dans la question (comparaison
// normalisée : tolère accents, tirets et l'article « Le »). `qn` est la
// question déjà normalisée. Retourne le NOM canonique du territoire.
function detectArrondissement(db, qn) {
  const territoires = all(db, 'SELECT nom FROM territoires ORDER BY nom');
  for (const t of territoires) {
    const n = normArr(t.nom);
    if (n && qn.includes(n)) return t.nom;
  }
  return null;
}

// Les points d'intérêt orthographient l'arrondissement autrement que les
// territoires (ex. « Rivière-des-Prairies–Pointe-aux-Trembles »). On retrouve
// la valeur exacte utilisée dans pointsdinteret en comparant les formes
// normalisées, pour pouvoir filtrer précisément ensuite.
function resolvePoiArr(db, territoireNom) {
  const target = normArr(territoireNom);
  const rows = all(db, 'SELECT DISTINCT arrondissement FROM pointsdinteret WHERE arrondissement IS NOT NULL');
  const match = rows.find((r) => normArr(r.arrondissement) === target);
  return match ? match.arrondissement : null;
}

function has(qn, ...mots) {
  return mots.some((m) => qn.includes(m));
}

// Construit le bloc de contexte textuel envoyé au LLM.
function buildContext(db, question) {
  // Question normalisée (sans accents, casse unifiée) pour une détection de
  // mots-clés robuste aux fautes de frappe et aux accents manquants.
  const qn = normArr(question);
  const parts = [];

  // 1. Résumé global — toujours inclus.
  const nbCompteurs = count(db, 'SELECT COUNT(*) AS n FROM compteurs');
  const nbFontaines = count(db, 'SELECT COUNT(*) AS n FROM pointsdinteret');
  const nbPistes    = count(db, 'SELECT COUNT(*) AS n FROM pistes');
  const arrs = all(db, 'SELECT nom FROM territoires ORDER BY nom').map((r) => r.nom);

  parts.push(
    `RÉSUMÉ DU RÉSEAU :\n` +
    `- Compteurs vélo : ${nbCompteurs}\n` +
    `- Points d'intérêt (fontaines d'eau) : ${nbFontaines}\n` +
    `- Segments de pistes cyclables : ${nbPistes}\n` +
    `- Arrondissements couverts (${arrs.length}) : ${arrs.join(', ')}`
  );

  // 2. Arrondissement ciblé, le cas échéant.
  const arr = detectArrondissement(db, qn);
  if (arr) {
    const nbCptArrRows = all(db, 'SELECT COUNT(*) AS n FROM compteurs WHERE arrondissement = ?', [arr]);
    const nbCptArr = nbCptArrRows.length ? (nbCptArrRows[0].n ?? 0) : 0;
    const compteursArr = all(
      db,
      'SELECT nom, statut, annee_implante FROM compteurs WHERE arrondissement = ? ORDER BY nom LIMIT 8',
      [arr]
    );
    let bloc = `ARRONDISSEMENT « ${arr} » :\n- Compteurs : ${nbCptArr}`;
    if (compteursArr.length) {
      bloc += '\n- Exemples de compteurs :\n' +
        compteursArr.map((c) => `  • ${c.nom} (${c.statut ?? 'statut inconnu'}, implanté ${c.annee_implante ?? '?'})`).join('\n');
    }
    parts.push(bloc);
  }

  // 3. Points d'intérêt / fontaines / points d'eau.
  if (has(qn, 'fontaine', 'eau', 'boire', 'point', 'interet', 'parc', 'lieu')) {
    const poiArr = arr ? resolvePoiArr(db, arr) : null;
    const rows = poiArr
      ? all(db, 'SELECT nom_parc_lieu, arrondissement, intersection FROM pointsdinteret WHERE arrondissement = ? LIMIT 10', [poiArr])
      : all(db, 'SELECT nom_parc_lieu, arrondissement, intersection FROM pointsdinteret WHERE nom_parc_lieu IS NOT NULL LIMIT 8');

    if (rows.length) {
      const titre = poiArr ? `POINTS D'INTÉRÊT DANS « ${arr} »` : `POINTS D'INTÉRÊT (échantillon)`;
      parts.push(
        `${titre} :\n` +
        rows.map((r) => `- ${r.nom_parc_lieu || 'Sans nom'} — ${r.arrondissement || 'arr. inconnu'}${r.intersection ? ` (${r.intersection})` : ''}`).join('\n')
      );
    } else if (arr) {
      // Distinction explicite : arrondissement reconnu mais aucun POI recensé.
      parts.push(`POINTS D'INTÉRÊT DANS « ${arr} » : aucun point d'intérêt recensé dans les données pour cet arrondissement.`);
    }
  }

  // 4. Compteurs les plus fréquentés.
  if (has(qn, 'compteur', 'passage', 'populaire', 'frequent', 'achaland', 'trafic')) {
    const rows = all(
      db,
      `SELECT c.nom AS nom, SUM(cv.nb_passages) AS total
         FROM comptage_velo cv
         JOIN compteurs c ON CAST(cv.id_compteur AS TEXT) = c.id
        GROUP BY cv.id_compteur
        ORDER BY total DESC
        LIMIT 5`
    );
    if (rows.length) {
      parts.push(
        `COMPTEURS LES PLUS FRÉQUENTÉS (total de passages enregistrés) :\n` +
        rows.map((r, i) => `${i + 1}. ${r.nom} — ${r.total} passages`).join('\n')
      );
    }
  }

  const context = parts.join('\n\n');
  return context.length > MAX_CONTEXT_CHARS ? context.slice(0, MAX_CONTEXT_CHARS) : context;
}

module.exports = { buildContext };
