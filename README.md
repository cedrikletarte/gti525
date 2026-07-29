# MTL Vélo — GTI525

Application web sur le réseau cyclable de la Ville de Montréal : pistes cyclables, compteurs de passage, points d'intérêt, territoires, et un assistant IA (Vélobot) répondant à partir de ces données. Le projet est composé d'une frontale React/Vite (racine du repo) et d'une API backend Express (`backend/`).

## Prérequis

- Node.js (LTS récente)
- Docker (pour MariaDB) — ou une instance MariaDB/MySQL déjà disponible
- Une clé API LLM (palier gratuit [Groq](https://console.groq.com/keys)) pour activer l'assistant IA — optionnel, le reste de l'app fonctionne sans

## Installation

```bash
git clone <url-du-repo>
cd gti525

# Dépendances frontale
npm install

# Dépendances backend
cd backend
npm install
cd ..
```

## Variables d'environnement

### Backend (`backend/.env`)

Copier le gabarit puis remplir les valeurs :

```bash
cd backend
cp .env-example .env
```

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret de signature des jetons JWT (min. 32 caractères) |
| `DB_HOST` | Hôte MariaDB (`127.0.0.1` par défaut) |
| `DB_PORT` | Port MariaDB (`3306` par défaut) |
| `DB_USER` | Utilisateur MariaDB (voir `docker-compose.yml`) |
| `DB_PASSWORD` | Mot de passe MariaDB (voir `docker-compose.yml`) |
| `DB_NAME` | Nom de la base (`mtlvelo`) |
| `LLM_PROVIDER` | Fournisseur LLM de l'assistant (`groq`) |
| `LLM_API_KEY` | Clé d'API du fournisseur — reste côté serveur, jamais exposée à la frontale |
| `LLM_MODEL` | Modèle LLM (optionnel, défaut `llama-3.1-8b-instant`) |
| `ASSISTANT_RATE_MAX` / `ASSISTANT_RATE_WINDOW_MS` | Limitation de débit de l'assistant (optionnel, défauts 15 req/60s) |

`JWT_SECRET`, `DB_USER`, `DB_PASSWORD` et `DB_NAME` sont requis au démarrage ; le serveur refuse de démarrer s'il en manque un.

### Frontale (racine, `.env` — optionnel)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | URL de base de l'API backend. Défaut : `http://localhost:8080/gti525/v1` (défini dans `src/api/client.js`). À définir uniquement si le backend tourne sur un autre hôte/port, ou pour un build de production. |

## Base de données

Depuis `backend/`, démarrer MariaDB via Docker :

```bash
cd backend
docker compose up -d
```

Les identifiants créés par `docker-compose.yml` doivent correspondre à `DB_USER`/`DB_PASSWORD`/`DB_NAME` dans `backend/.env`.

Au premier démarrage du serveur, les tables sont créées et importées automatiquement à partir des CSV de `backend/data/` si la base est vide (`scripts/seed.js`) — aucune importation manuelle n'est nécessaire.

## Démarrage

### Backend

```bash
cd backend
npm start        # ou : npm run dev (rechargement automatique)
```

Démarre sur `http://localhost:8080`.

### Frontale

Depuis la racine :

```bash
npm run dev
```

Démarre sur `http://localhost:5173` (proxy Vite vers le backend configuré dans `vite.config.js`).

## Tests

```bash
cd backend
npm test
```

## Documentation de l'API

L'API est auto-documentée : `GET http://localhost:8080/gti525/v1/` retourne la liste de toutes les routes disponibles, générée dynamiquement à partir des routeurs montés.

## Documentation complémentaire

- [DEMARCHE.md](DEMARCHE.md) — décisions de conception et justifications
- [PROMPTS.md](PROMPTS.md) — historique des prompts utilisés avec l'assistance IA
