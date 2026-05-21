# 📋 Journal des prompts — MTL Vélo

> Consigne chaque tâche significative réalisée avec assistance IA :
> prompt utilisé · outil & modèle · sortie obtenue · modifications humaines · justification.

---

## Table des matières

| # | Tâche | Date |
|---|-------|-------|
| [01](#tache-01) | Scaffold UI — Navbar, HomePage, thème MUI | 2026-05-14 |
| [02](#tache-02) | Navbar color — Change theme color | 2026-05-14 |
| [03](#tache-03) | Statistic.jsx — Page compteurs vélo avec DataGrid | 2026-05-17 |
| [04](#tache-04) | Routing — Navigation Navbar vers Statistic | 2026-05-17 |
| [05](#tache-05) | DataGrid — Table MUI → MUI X DataGrid | 2026-05-17 |
| [06](#tache-06) | Layout — Alignement Typography "Compteurs vélo" à gauche | 2026-05-17 |
| [07](#tache-07) | About.jsx — Page "À propos" + route /a-propos | 2026-05-17 |
| [10](#tache-10) | Page "Point Interet" | 2026-05-21 |
| [10](#tache-11) | Correction Element Page "Point Interet" | 2026-05-21 |

  

---

## Tâche 01 — Scaffold UI : Navbar + HomePage + thème MUI {#tache-01}

### 🗂 Contexte

Projet React + Vite **MTL Vélo** — visualisation du réseau cyclable de Montréal.
MUI (`@mui/material`, `@emotion/react`, `@mui/icons-material`) déjà installé.
Fichiers existants : `src/App.jsx`, `src/App.css`.

---

### 💬 Prompt

```
Contexte: Je développe une application web React + Vite appelée "MTL Vélo" 
(visualisation du réseau cyclable de Montréal). Le projet utilise déjà 
src/App.jsx et src/App.css. MUI (@mui/icons-material @mui/material @emotion/styled @emotion/react) est disponible dans le projet.

Tâche: Génère les fichiers suivants:
  - src/components/Navbar.jsx  → barre de navigation réutilisable
  - src/pages/HomePage.jsx     → page d'accueil qui importe Navbar
  - src/theme.js               → ThemeProvider MUI partagé

--- COMPOSANT Navbar.jsx ---
Navbar est un composant autonome réutilisable par toutes les pages futures.
Il accepte une prop "activePage" (string) pour mettre en évidence le lien actif.

Implémentation via MUI AppBar + Toolbar:
- Logo textuel "🚲 MTL Vélo" à gauche (Typography variant="h6")
- Liens de navigation: Accueil, Réseau, Statistiques, Points d'intérêt, 
  Assistant, À propos (MUI Button)
- Le lien correspondant à activePage a un style distinct 
  (ex: sx borderBottom ou color différent)
- État :hover visible sur tous les liens
- Boutons "Connexion" (variant="outlined") et "Inscription" 
  (variant="contained") à droite
- Responsive: Drawer + IconButton menu hamburger sur mobile (<768px)

--- PAGE HomePage.jsx ---
Importe <Navbar activePage="Accueil" /> en haut de page.

Structure (HTML5 sémantique obligatoire):
1. <header> contenant <Navbar activePage="Accueil" />

2. <main> contenant:
   a) Section hero (Box avec sx, background: 'linear-gradient(to right, #1f5b2c, #2a763b)'):
      - Titre h1 "MTL Vélo" (Typography variant="h2") en blanc
      - Sous-titre (Typography variant="subtitle1") en blanc

   b) Section stats via MUI Grid (3 colonnes même largeur qui prenne l'ensemble de la place disponible, Paper elevation=2):
      - "8 088 / Segments de pistes"
      - "970.4 km / Longueur totale du réseau"
      - "64 / Compteurs vélo"
      - Chiffres en Typography variant="h4" couleur verte
      - Ces valeurs sont des props pour pouvoir les remplacer par des 
        données réelles plus tard

   c) Section feature cards via MUI Grid + Card (3 colonnes de même largeur qui prenne l'ensemble de la place disponible):
      - "Réseau cyclable" avec CardContent + CardActions + Button
      - "Statistiques" avec CardContent + CardActions + Button
      - "Assistant" avec CardContent + CardActions + Button

3. <footer> minimaliste (Box component="footer")

--- THÈME theme.js ---
MUI ThemeProvider avec:
  primary: { main: '#2d6a4f' }
  secondary: { main: '#ffffff' }

Contraintes obligatoires:
- Contraste minimal 4.5:1 WCAG 2.1 AA (vert sur blanc)
- Zone de contenu via MUI Container maxWidth="lg" (≈1280px)
- Responsive via MUI Grid et sx breakpoints (xs, sm, md)
- Aucun fichier CSS séparé — tout le style via sx props ou ThemeProvider
- Aucun console.log dans le code final

Retourne uniquement les trois fichiers: Navbar.jsx, HomePage.jsx et theme.js.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

Trois fichiers créés + `App.jsx` mis à jour :

| Fichier | Contenu généré |
|---------|---------------|
| `src/theme.js` | `createTheme` avec `primary: #2d6a4f`, `secondary: #fff`, `textTransform: none` sur les boutons |
| `src/components/Navbar.jsx` | AppBar + Toolbar, liens desktop avec `borderBottom` actif, hover, Drawer mobile avec `MenuIcon` |
| `src/pages/HomePage.jsx` | Section hero (gradient), grille stats (props : `segmentsCount`, `totalKm`, `countersCount`), grille feature cards — tout en `sx`, zéro CSS externe |
| `src/App.jsx` | Rebranché avec `ThemeProvider` + `CssBaseline`, rendu de `<HomePage />` |

**Valeurs par défaut des stats :** 8 088 segments · 970,4 km · 64 compteurs.

---

### ✏️ Modifications apportées par l'humain

- Supprimer button "explorer" dans les feature cards

---

### 🧠 Justification

J'ai accepté l'essentiel de la sortie, car la structure générée était conforme aux exigences du livrable (HTML5 sémantique, responsive, thème centralisé) et le code était lisible et bien organisé. La prop `activePage` pour indiquer le lien actif était une bonne approche que je n'aurais pas pensé moi-même.

J'ai retiré le bouton `Explorer` dans les feature cards. L'IA l'a généré sans que je le demande. Ce bouton n'apparaissait pas dans la maquette fournie et n'avait aucun comportement. J'ai préféré supprimer plutôt que de laisser du code mort.

---

## Tâche 02 — Navbar color : Change theme color {#tache-02}

### 🗂 Contexte

Projet React + Vite **MTL Vélo** — visualisation du réseau cyclable de Montréal.
MUI (`@mui/material`, `@emotion/react`, `@mui/icons-material`) déjà installé.
Fichiers existants : `src/App.jsx`, `src/App.css`, `src/theme.js`, `src/components/Navbar.jsx`, `src/pages/HomePage.jsx`.

---

### 💬 Prompt

```
Le fond de la barre de navigation doit être blanc. Le texte « MTL Vélo » doit utiliser la couleur primary du thème. Les liens vers les différentes pages doivent être en gris pâle. Le bouton « Connexion » doit avoir un fond blanc avec un contour et un texte utilisant la couleur primary du thème. Le bouton « Inscription » doit avoir un fond utilisant la couleur primary du thème avec un texte blanc.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

Un fichier `src/components/Navbar.jsx` mis à jour :

| Fichier | Contenu généré |
|---------|---------------|
| `src/components/Navbar.jsx` | -AppBar — `color="primary"` retiré, remplacé par `sx={{ backgroundColor: 'white' }}`<br>- "MTL Vélo" — `color: 'primary.main'` ajouté directement sur la `Typography`<br>- Liens de navigation — couleur `grey.500` par défaut, `primary.main` pour le lien actif et au hover ; le `borderBottom` actif utilise aussi `primary.main`<br>- Boutons auth — les `sx` personnalisés sont supprimés ; `variant="outlined" color="primary"` et `variant="contained" color="primary"` suffisent maintenant que l’AppBar est blanche (MUI applique les bonnes couleurs de thème automatiquement)<br>- Hamburger mobile — `color="inherit"` remplacé par `sx={{ color: 'primary.main' }}` pour rester visible sur fond blanc` |



---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification

J'ai accepté la sortie sans modification. L'IA a correctement traduit mes exigences visuelles en code MUI : supprimer `color=primary` sur l'`AppBar` pour passer à un fond blanc, puis ajuster chaque élément (logo, liens, boutons, hamburger). J'ai vérifié que l'approche `variant="outlined" color="primary"` sur les boutons Connexion/Inscription était bien cohérent avec la maquette fournie.

---

## Tâche 03 — Statistic.jsx : page compteurs vélo {#tache-03}

### 🗂 Contexte

Projet React + Vite **MTL Vélo**. Fichiers existants : `src/App.jsx`, `src/theme.js`, `src/components/Navbar.jsx`, `src/pages/HomePage.jsx`. Données source : `src/data/compteurs.csv` (colonnes réelles : `ID, Nom, Statut, Latitude, Longitude, Annee_implante`).

---

### 💬 Prompt

```
Génère uniquement le fichier src/pages/Statistic.jsx,

Contexte: Je développe une application web React + Vite appelée "MTL Vélo"
(visualisation du réseau cyclable de Montréal). Le projet utilise déjà
src/HomePage.jsx et src/Theme.js. MUI (@mui/icons-material @mui/material @emotion/styled @emotion/react) est disponible dans le projet.

Tâche: Génère le fichier suivant:
  - src/pages/Statistic.jsx  →  page de statistiques pour visualiser les compteurs vélo via les données src/data/compteurs.csv

Colonnes disponibles dans compteurs.csv: id, nom, statut, annee, arrondissement
  - Ex: id = 1000054073
  - Ex: nom = Bord-du-lac vers est
  - Ex: statut = Actif | En maintenance | Inactif_déplacé
  - Ex: annee = 2012
  - Ex: arrondissement = Verdun

--- PAGE Statistic.jsx ---

Importe <Navbar activePage="Accueil" /> en haut de page.
Parse le fichier CSV côté client avec papaparse (import statique via Vite ou fetch vers /src/data/compteurs.csv).
Tout le filtrage est effectué en mémoire, sans appel réseau supplémentaire.

Structure HTML5 sémantique obligatoire:

1. <header> contenant <Navbar activePage="Statistiques" />

2. <main> encapsulé dans <Container maxWidth="lg"> contenant:

   a) Section filtres (une seule ligne horizontale):
      - À gauche: Typography variant="h2" avec le texte "Compteurs vélo"
      - À droite dans cet ordre:
          1. TextField (label="Rechercher par nom", variant="outlined") — filtre en temps réel sur le champ nom
          2. Button style identique au bouton "Connexion" du Navbar (outlined) —
             libellé "Effacer les filtres" — remet TextField 

   b) Section tableau:
      Colonnes affichées: ID | Nom | Statut | Année | Actions

      Rendu de la colonne Statut (Chip ou Box inline):
        - "Actif"             → fond vert pâle, texte vert foncé (contraste WCAG AA ≥ 4.5:1)
        - "En maintenance"    → fond gris pâle, texte gris foncé
        - "Inactif_déplacé"  → fond gris pâle, texte gris foncé

      Rendu de la colonne Actions (deux boutons par ligne):
        - Bouton "Carte"     → style identique au bouton "Connexion" du Navbar (outlined)
        - Bouton "Passages"  → style identique au bouton "Inscription" du Navbar (contained)

3. <footer> reproduction exacte du footer présent dans src/HomePage.jsx

--- THÈME theme.js ---

Importe et applique theme.js via ThemeProvider pour garantir la cohérence visuelle de l'ensemble de l'application.

Contraintes obligatoires:
  - Contraste minimal 4.5:1 WCAG 2.1 AA sur tous les éléments colorés
  - Zone de contenu via MUI Container maxWidth="lg" (≈1280px)
  - Responsive via MUI Grid et sx breakpoints (xs, sm, md)
  - Aucun fichier CSS séparé — tout le style via sx props ou ThemeProvider
  - Aucun console.log dans le code final

Retourne uniquement le code source complet de Statistic.jsx.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

| Fichier | Contenu généré |
|---------|---------------|
| `src/pages/Statistic.jsx` | Import statique `?raw` + parser CSV inline; `useMemo` pour le filtrage par nom ; composant `StatusBadge`; table MUI avec colonnes ID, Nom, Statut, Année, Actions ; ThemeProvider retiré ensuite (centralisé dans App.jsx) |

**Adaptation des données :** le CSV réel ne contient pas de colonne `arrondissement` — la colonne `Annee_implante` est utilisée à la place pour la colonne Année.

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification

J'ai accepté la sortie sans modification. L'IA a fait un choix en utilisant une fonction d'extraction des données du CSV à la place de l'utilisation d'une dépendance. J'ai jugé que ce choix était correct pour la taille et la complexité des données.

En revanche, l'IA a détecté que le CSV réel ne contenait pas de colonne `arrondissement` et a adapté en conséquence. J'ai accepté, car la maquette demandée ne correspondait pas aux données disponibles. L'IA a pris une décision raisonnable sans bloquer.

Ce que j'aurais dû corriger mais que j'ai laissé passer : le `StatusBadge` initial utilisait `display: 'inline-block'` qui ne s'alignait pas bien dans une row DataGrid. Ce n'était pas visible avec la Table MUI, mais c'est devenu un détail problématique à la tâche 05.

---

## Tâche 04 — Routing : navigation Navbar → Statistic {#tache-04}

### 🗂 Contexte

La Navbar affichait des liens sans comportement de navigation. `react-router-dom` n'était pas installé.

---

### 💬 Prompt

```
Update Navbar afin que lorsque je clique sur "Statistiques" cela amène
l'utilisateur sur la page Statistic.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

| Fichier | Contenu généré |
|---------|---------------|
| `src/App.jsx` | Ajout de `BrowserRouter` + `Routes` + `Route` ; routes `/` → `HomePage`, `/statistiques` → `Statistic` |
| `src/components/Navbar.jsx` | `NAV_LINKS` transformé en tableau d'objets `{ label, path }` ; chaque bouton de nav et `ListItemButton` mobile utilisent `component={Link} to={path}` ; logo "MTL Vélo" devient aussi un `Link` vers `/` |
| `src/pages/Statistic.jsx` | Retrait du `ThemeProvider` local (désormais centralisé dans `App.jsx`) |

**Installation :** `npm install react-router-dom`

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification

J'ai accepté la sortie sans modification. L'IA a non seulement ajouté le routing pour Statistiques comme demandé, mais a aussi transformé tous les liens de la Navbar en `Link` react-router-dom et fait du logo un lien vers `/`. C'est un comportement standard attendu dans les pages web ue j'ai pas explicitement demandé. J'aurais dû le spécifier, mais le résultat était correct et j'ai donc conservé ces ajouts. J'ai aussi apprécié que l'IA ait centralisé le `ThemeProvider` dans `App.jsx` en retirant le double wrapping de `Statistic.jsx`, ce qui améliorait la cohérence de l'architecture.

---

## Tâche 05 — DataGrid : Table MUI → MUI X DataGrid {#tache-05}

### 🗂 Contexte

La page `Statistic.jsx` utilisait une `Table` MUI classique sans tri ni pagination. `@mui/x-data-grid` avait été installé manuellement par l'utilisateur.

---

### 💬 Prompt

```
Transforme la Table de Statistic en Data table.
J'ai installé la dépendance : @mui/x-data-grid
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

| Fichier | Contenu généré |
|---------|---------------|
| `src/pages/Statistic.jsx` | `Table` / `TableHead` / `TableBody` / `TableRow` / `TableCell` / `TableContainer` / `Paper` remplacés par `<DataGrid>` ; définition `COLUMNS` avec `renderCell` pour `StatusBadge` et `ActionsCell` ; localisation `frFR` ; tri initial par Nom A→Z ; pagination 10/25/50/100 ; `disableRowSelectionOnClick` ; en-têtes colorés via `headerClassName` |

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification

J'ai accepté la structure globale de la sortie (colonnes, pagination, localisation `frFR`, tri initial), mais j'ai dû corriger le rendu du `StatusBadge` : l'IA avait conservé le `display: 'inline-block'` et `px/py` de la tâche 03, qui ne s'aligne pas correctement dans une cellule DataGrid (hauteur fixe de 52px). J'ai modifié le composant pour utiliser `display: 'block'` avec `lineHeight: '52px'` et ajouté un `Box` wrapper dans `renderCell` pour centrer verticalement.

---

## Tâche 06 — Layout : alignement Typography "Compteurs vélo" à gauche {#tache-06}

### 🗂 Contexte

La Typography "Compteurs vélo" dans la barre de filtres de `Statistic.jsx` n'était pas positionnée au bord gauche du Container.

---

### 💬 Prompt

```
La Typography "Compteur Vélo" ne se trouve pas sur la gauche le plus
possible de l'écran.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Correction ciblée |

---

### 📦 Sortie obtenue

| Fichier | Contenu généré |
|---------|---------------|
| `src/pages/Statistic.jsx` | Box filtre : `justifyContent: 'space-between'` remplace `flexGrow: 1` sur la Typography ; TextField + Button regroupés dans un Box imbriqué à droite. |

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification

J'ai accepté la correction sans modification. Le problème venait du `flexGrow: 1` sur la `Typography` qui, combiné au `gap: 2` du Box parent, ne garantissait pas un ancrage strict à gauche dans tous les contextes. L'IA a remplacé cela par `justifyContent: 'space-between'` avec un Box imbriqué regroupant TextField et Button.

---

## Tâche 07 — About.jsx : page "À propos" {#tache-07}

### 🗂 Contexte

Projet React + Vite **MTL Vélo**. Fichiers existants : `src/App.jsx`, `src/theme.js`, `src/components/Navbar.jsx`, `src/pages/HomePage.jsx`, `src/pages/Statistic.jsx`. La route `/a-propos` était déjà déclarée dans `NAV_LINKS` de la Navbar mais pointait vers une page inexistante.

---

### 💬 Prompt

```
Génère uniquement le fichier src/pages/About.jsx.

Contexte: Je développe une application web React + Vite appelée "MTL Vélo"
(visualisation du réseau cyclable de Montréal). Le projet utilise déjà
src/HomePage.jsx, src/Statistic.jsx et src/Theme.js. MUI (@mui/icons-material @mui/material
@emotion/styled @emotion/react @mui/x-data-grid) est disponible dans le projet.

Tâche: Génère le fichier suivant:
  - src/pages/About.jsx → page "À propos" présentant les informations sur
    l'application MTL Vélo.

--- PAGE About.jsx ---

Importe <Navbar activePage="À propos" /> en haut de page.

Structure HTML5 sémantique obligatoire:

1. <header> contenant <Navbar activePage="À propos" />

2. <main> encapsulé dans <Container maxWidth="lg"> contenant:

   Une seule carte (Paper ou Card MUI) centrée horizontalement avec padding
   généreux, contenant les sections suivantes dans l'ordre:

   a) Titre principal:
      - Typography variant="h4" fontWeight=700 : "À propos de MTL Vélo"

   b) Section "Source des données":
      - Typography variant="h6" fontWeight=700 couleur verte (theme primary) : "Source des données"
      - Paragraphe introductif : "Les données utilisées dans cette application
        proviennent des Données ouvertes de la Ville de Montréal :"
        ("Données ouvertes de la Ville de Montréal" en gras)
      - Liste à puces (<ul>) avec les items suivants:
          • Compteurs de vélos (emplacements et passages)
          • Réseau cyclable (9 100+ segments de pistes)
          • Fontaines d'eau potable
          • Délimitations des arrondissements

   c) Section "Technologies":
      - Typography variant="h6" fontWeight=700 couleur verte (theme primary) : "Technologies"
      - Liste à puces (<ul>) avec les items suivants (label en gras, valeur normal):
          • Dorsale : Node.js 18+, Express 4, SQLite (better-sqlite3)
          • Authentification : bcrypt, JSON Web Tokens (JWT)
          • Cartographie : Leaflet 1.9 avec tuiles OpenStreetMap
          • Graphiques : Chart.js 4
          • Interface : HTML5, CSS moderne, JavaScript ES2020 (modules ES)

   d) Section "Contexte pédagogique":
      - Typography variant="h6" fontWeight=700 couleur verte (theme primary) : "Contexte pédagogique"
      - Paragraphe : "Ce projet est réalisé dans le cadre du cours GTI525 —
        Technologies des applications web. Il illustre l'intégration d'un
        front-end SPA, d'une API REST sécurisée et d'un assistant
        conversationnel ancré sur des données réelles."
        ("GTI525 — Technologies des applications web" en gras)

   e) Section "Compte de démonstration":
      - Typography variant="h6" fontWeight=700 couleur verte (theme primary) : "Compte de démonstration"
      - Deux lignes de texte couleur grise :
          • Courriel :  demo@gti525.ca  (valeur en monospace/code)
          • Mot de passe :  Demo2026!   (valeur en monospace/code)

3. <footer> reproduction exacte du footer présent dans src/HomePage.jsx

--- THÈME theme.js ---

Importe et applique theme.js via ThemeProvider pour garantir la cohérence
visuelle de l'ensemble de l'application.

Contraintes obligatoires:
  - Contraste minimal 4.5:1 WCAG 2.1 AA sur tous les éléments colorés
  - Zone de contenu via MUI Container maxWidth="lg" (≈1280px)
  - Responsive via MUI Grid et sx breakpoints (xs, sm, md)
  - Aucun fichier CSS séparé — tout le style via sx props ou ThemeProvider
  - Aucun console.log dans le code final

Retourne uniquement le code source complet de About.jsx.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

| Fichier | Contenu généré |
|---------|---------------|
| `src/pages/About.jsx` | `Paper` centré (`maxWidth: 720, mx: 'auto'`) ; composant interne `SectionTitle` pour éviter la répétition des `sx` ; constantes `DATA_SOURCES` et `TECHNOLOGIES` hors composant ; valeurs monospace via `<Box component="code">` ; footer identique à `HomePage.jsx` |
| `src/App.jsx` | Ajout de `import About` + `<Route path="/a-propos" element={<About />} />` |

---

### ✏️ Modifications apportées par l'humain

- Ajout de `textAlign: 'left'` sur le `Paper`

---

### 🧠 Justification

J'ai accepté la structure et le contenu de la page, mais j'ai ajouté `textAlign: 'left'` sur le `Paper`. L'IA n'avait pas spécifié d'alignement explicite sur le conteneur principal, ce qui laissait certains éléments (notamment les listes) hériter d'un alignement centré venant du composant `Paper`. La correction était mineure mais a permis d'améliorer la lisibilité.


## Tâche 10 : Création de la page Points d'intérêt (Phase 1)

### 💬 Prompt utilisé
> "Agis en tant que développeur front-end expert spécialisé , En utilisant la tech stack du projet MTL velo. Genere la page point interet dans src/pages/PointInteret.Voici les livrable a accomplir Charger compteurs.csv et poi.csv côté client qui se trouve dans le dosser /src/data et afficher les données dans un tableau triable (clic sur l'en-tête). Points d'intérêt: arrondissement, type, nom du lieu, adresse, jouter un filtre par arrondissement (menu déroulant, alimenté par territoires.csv) pour « Points d'intérêt , Pour chaque élément, ajouter un bouton « Voir sur la carte » ouvrant sa position dans Google Maps ou OpenStreetMap à partir des coordonnées. Limiter l'affichage des points d'intérêt à 20 par page (pagination ou défilement). Utilise le la maquette UI_pointInteret.png dans le fichier src/UIMock. tu dois Suivre a la lettre la structure des elements dans l'image."

### 🛠 Outil & modèle
| Champ | Valeur |
|-------|--------|
| **Outil** | GitHub Copilot — VS Code |
| **Modèle** | Gemini 3.1 Pro (Preview) |

### 📦 Sortie obtenue
Création d'un composant de base `PointInteret.jsx` avec un parseur CSV fait main et implémentation du filtrage par arrondissement.

### ✏️ Modifications apportées par l'humain

- Aucune

### 🧠 Justification

- J’ai accepté les modifications faites par l’IA, car celles-ci respectaient les besoins que j’avais spécifiés dans le prompt. J’ai également analysé le code généré par l’IA afin de m’assurer que l’implémentation n’était pas trop complexe et que nous pouvions bien comprendre le fonctionnement du filtrage par arrondissement.
---

## Tâche 11: Ajustement aux maquettes UI et retrait des éléments non-sollicités (Phase 2 & 3)

### 💬 Prompt utilisé
> "Il manque le bouton Nouveau point d’intérêt en haut à droite, et il manque la recherche par nom. L’arrangement du tableau devrait être : Type, Nom, Arrondissement, Intersection, Actions. Le bouton Actions est nommé Carte et ne contient pas d’icône. Il manque aussi le filtre par type à côté de Filtrer par arrondissement. Enfin, le type Fontaine devrait être affiché en bleu."

### 🛠 Outil & modèle
| Champ | Valeur |
|-------|--------|
| **Outil** | GitHub Copilot — VS Code |
| **Modèle** | Gemini 3.1 Pro (Preview) |

### 📦 Sortie obtenue
Ajout de l'élément pour le filtrage par nom 
Ajout du boutton Nouveau point intérêt 
Re-arrangement des elements pour suivre la maquettre fournie dans l'enonce du laboratoire 

### ✏️ Modifications apportées par l'humain

- Aucune

### 🧠 Justification

- Justification : J’ai accepté les modifications, car elles répondaient au besoin de correction décrit dans le prompt.

---
