'use strict';
const express   = require('express');
const { setDb } = require('./lib/db');

const app = express();
app.use(express.json());

app.get('/gti525/v1/', (_req, res) => {
  res.json({
    api: 'GTI525 — MTL Vélo',
    version: 'v1',
    endpoints: [
      { methode: 'GET',    chemin: '/gti525/v1/',                       description: 'Liste tous les points de terminaison disponibles' },
      { methode: 'POST',   chemin: '/gti525/v1/auth/inscription',       description: 'Crée un compte utilisateur', corps: { courriel: 'string', motDePasse: 'string' } },
      { methode: 'POST',   chemin: '/gti525/v1/auth/connexion',         description: 'Authentifie et retourne un JWT valide 24h', corps: { courriel: 'string', motDePasse: 'string' } },
      { methode: 'GET',    chemin: '/gti525/v1/compteurs',              description: 'Liste paginée des compteurs', parametres: { nom: 'recherche textuelle', statut: 'filtre exact', arrondissement: 'filtre exact', implantation: 'année minimale', limite: 'entier (déf. 20)', page: 'entier (déf. 1)' } },
      { methode: 'GET',    chemin: '/gti525/v1/compteurs/:id',          description: "Informations d'un compteur (sans passages)" },
      { methode: 'GET',    chemin: '/gti525/v1/compteurs/:id/passages', description: 'Passages agrégés pour un compteur', parametres: { debut: 'YYYY-MM-DD', fin: 'YYYY-MM-DD', intervalle: 'jour|semaine|mois (déf. jour)' } },
      { methode: 'GET',    chemin: '/gti525/v1/pistes',                 description: 'Réseau cyclable (GeoJSON FeatureCollection)', parametres: { arrondissement: 'filtre par nom', saisons4: 'Oui|Non', categorie: 'rev|voiePartagee|voieProtegee|sentierPolyvalent', populaireDebut: 'YYYY-MM-DD (avec populaireFin)', populaireFin: 'YYYY-MM-DD (avec populaireDebut)' } },
      { methode: 'GET',    chemin: '/gti525/v1/territoires',            description: 'Limites des arrondissements (GeoJSON FeatureCollection)' },
      { methode: 'GET',    chemin: '/gti525/v1/pointsdinteret',         description: "Liste paginée des points d'intérêt", parametres: { nom: 'recherche textuelle', type: 'filtre exact', arrondissement: 'filtre exact', limite: 'entier (déf. 20)', page: 'entier (déf. 1)' } },
      { methode: 'POST',   chemin: '/gti525/v1/pointsdinteret',         description: "Ajouter un point d'intérêt (authentification requise)" },
      { methode: 'PUT',    chemin: '/gti525/v1/pointsdinteret/:id',     description: "Modifier un point d'intérêt (authentification requise)" },
      { methode: 'DELETE', chemin: '/gti525/v1/pointsdinteret/:id',     description: "Supprimer un point d'intérêt (authentification requise)" },
      { methode: 'POST',   chemin: '/gti525/v1/assistant',             description: "Assistant conversationnel : pose une question et reçoit une réponse basée sur les données du réseau", corps: { question: 'string (max 1000 caractères)' } },
      { methode: 'POST',   chemin: '/gti525/v1/assistant/signalement', description: "Signaler une mauvaise réponse de l'assistant (consignée dans un journal serveur)", corps: { question: 'string', reponse: 'string' } },
    ],
  });
});

app.use('/gti525/v1/auth',           require('./routes/auth'));
app.use('/gti525/v1/compteurs',      require('./routes/compteurs'));
app.use('/gti525/v1/pistes',         require('./routes/pistes'));
app.use('/gti525/v1/territoires',    require('./routes/territoires'));
app.use('/gti525/v1/pointsdinteret', require('./routes/pointsdinteret'));
app.use('/gti525/v1/assistant',      require('./routes/assistant'));

app.use((_req, res) => res.status(404).json({ erreur: 'Route not found.' }));

module.exports = { app, setDb };
