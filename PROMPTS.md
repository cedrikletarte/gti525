# 📋 Journal des prompts — MTL Vélo

## Équipe et parcours

- **Équipe** : 3 - Membres : Cédrik Letarte, Justin Maitland, Youcef Mekki Daouadji
- **Parcours déclaré** : **avec IA**
- **Date de déclaration** : 2026-05-14
- **Outils utilisés ce trimestre** : Claude code 4.7 Sonnet, GitHub Copilot dans VS Code

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
| [08](#tache-08) | Reseau.jsx : Icone de cercle | 2026-05-20 |
| [09](#tache-09) | Allignement du texte des bouton à gauche | 2026-05-20 |
| [10](#tache-10) | Ajout d'une carte dans la page Reseau | 2026-05-20 |
| [11](#tache-11) | Points d'intérêt — Création de la page (Phase 1) | 2026-05-21 |
| [12](#tache-12) | Points d'intérêt — Ajustement aux maquettes UI (Phase 2 & 3) | 2026-05-21 |
| [13](#tache-13) | Reseau.jsx : Changement du comportement sur petit écran | 2026-05-21 |
| [14](#tache-14) | Reseau.jsx : Chargement d'un fichier geojson | 2026-05-21 |
| [15](#tache-15) | Assistant.jsx : Création de la page Assistant | 2026-06-01 |
| [16](#tache-16) | Assistant.jsx : Retrait de l'historique | 2026-06-01 |
| [17](#tache-17) | Assistant.jsx : Amélioration de la zone de saisie | 2026-06-01 |
| [18](#tache-18) | Accessibilité : Correction des contrastes WCAG 2.1 AA | 2026-06-04 |

  

---

## Tâche 01 — Scaffold UI : Navbar + HomePage + thème MUI {#tache-01}

**Auteur** : Cédrik Letarte - 2026-05-14

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
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

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

- **Accepté** : J'ai accepté l'essentiel de la sortie, car la structure générée était conforme aux exigences du livrable (HTML5 sémantique, responsive, thème centralisé) et le code était lisible et bien organisé. La prop `activePage` pour indiquer le lien actif était une bonne approche que je n'aurais pas pensé moi-même.

- **Modifié** : J'ai retiré le bouton `Explorer` dans les feature cards. L'IA l'a généré sans que je le demande. Ce bouton n'apparaissait pas dans la maquette fournie et n'avait aucun comportement. J'ai préféré supprimer plutôt que de laisser du code mort.

- **Leçon** : L'IA, malgré des directives claires, semble utiliser une certaine créativité. Il faut préciser de ce tenir seulement à la maquette originale.

---

## Tâche 02 — Navbar color : Change theme color {#tache-02}

**Auteur** : Cédrik Letarte - 2026-05-14

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

- **Accepté** : J'ai accepté la sortie sans modification. L'IA a correctement traduit mes exigences visuelles en code MUI : supprimer `color=primary` sur l'`AppBar` pour passer à un fond blanc, puis ajuster chaque élément (logo, liens, boutons, hamburger). J'ai vérifié que l'approche `variant="outlined" color="primary"` sur les boutons Connexion/Inscription était bien cohérent avec la maquette fournie.

---

## Tâche 03 — Statistic.jsx : page compteurs vélo {#tache-03}

**Auteur** : Cédrik Letarte - 2026-05-17

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

- Ajout de la logique d’ouverture du lien Google Maps lors du clic sur le bouton « Carte ».

---

### 🧠 Justification

- **Accepté** : J'ai accepté la sortie sans modification. L'IA a fait un choix en utilisant une fonction d'extraction des données du CSV à la place de l'utilisation d'une dépendance. J'ai jugé que ce choix était correct pour la taille et la complexité des données.

En revanche, l'IA a détecté que le CSV réel ne contenait pas de colonne `arrondissement` et a adapté en conséquence. J'ai accepté, car la maquette demandée ne correspondait pas aux données disponibles. L'IA a pris une décision raisonnable sans bloquer.

- **Modifié** : Ce que j'aurais dû corriger mais que j'ai laissé passer : le `StatusBadge` initial utilisait `display: 'inline-block'` qui ne s'alignait pas bien dans une row DataGrid. Ce n'était pas visible avec la Table MUI, mais c'est devenu un détail problématique à la tâche 05.

---

## Tâche 04 — Routing : navigation Navbar → Statistic {#tache-04}

**Auteur** : Cédrik Letarte - 2026-05-17

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

- **Accepté** : J'ai accepté la sortie sans modification. L'IA a non seulement ajouté le routing pour Statistiques comme demandé, mais a aussi transformé tous les liens de la Navbar en `Link` react-router-dom et fait du logo un lien vers `/`. C'est un comportement standard attendu dans les pages web ue j'ai pas explicitement demandé. J'aurais dû le spécifier, mais le résultat était correct et j'ai donc conservé ces ajouts. J'ai aussi apprécié que l'IA ait centralisé le `ThemeProvider` dans `App.jsx` en retirant le double wrapping de `Statistic.jsx`, ce qui améliorait la cohérence de l'architecture.

---

## Tâche 05 — DataGrid : Table MUI → MUI X DataGrid {#tache-05}

**Auteur** : Cédrik Letarte - 2026-05-17

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

- **Accepté** : J'ai accepté la structure globale de la sortie (colonnes, pagination, localisation `frFR`, tri initial), mais j'ai dû corriger le rendu du `StatusBadge` : l'IA avait conservé le `display: 'inline-block'` et `px/py` de la tâche 03, qui ne s'aligne pas correctement dans une cellule DataGrid (hauteur fixe de 52px). J'ai modifié le composant pour utiliser `display: 'block'` avec `lineHeight: '52px'` et ajouté un `Box` wrapper dans `renderCell` pour centrer verticalement.

---

## Tâche 06 — Layout : alignement Typography "Compteurs vélo" à gauche {#tache-06}

**Auteur** : Cédrik Letarte - 2026-05-17

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

- **Accepté** : J'ai accepté la correction sans modification. Le problème venait du `flexGrow: 1` sur la `Typography` qui, combiné au `gap: 2` du Box parent, ne garantissait pas un ancrage strict à gauche dans tous les contextes. L'IA a remplacé cela par `justifyContent: 'space-between'` avec un Box imbriqué regroupant TextField et Button.

---

## Tâche 07 — About.jsx : page "À propos" {#tache-07}

**Auteur** : Cédrik Letarte - 2026-05-17

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

- **Accepté** : J'ai accepté la structure et le contenu de la page.

- **Modifié** :  J'ai ajouté `textAlign: 'left'` sur le `Paper`. L'IA n'avait pas spécifié d'alignement explicite sur le conteneur principal, ce qui laissait certains éléments (notamment les listes) hériter d'un alignement centré venant du composant `Paper`. La correction était mineure mais a permis d'améliorer la lisibilité.


## Tâche 11 — Création de la page Points d’intérêt (Phase 1) {#tache-11}

**Auteur** : Youcef Mekki Daouadji - 2026-05-21

### 💬 Prompt

```
Agis en tant que développeur front-end expert spécialisé , En utilisant la tech stack du projet MTL velo. Genere la page point interet dans src/pages/PointInteret.Voici les livrable a accomplir Charger compteurs.csv et poi.csv côté client qui se trouve dans le dosser /src/data et afficher les données dans un tableau triable (clic sur l’en-tête). Points d’intérêt: arrondissement, type, nom du lieu, adresse, jouter un filtre par arrondissement (menu déroulant, alimenté par territoires.csv) pour « Points d’intérêt , Pour chaque élément, ajouter un bouton « Voir sur la carte » ouvrant sa position dans Google Maps ou OpenStreetMap à partir des coordonnées. Limiter l’affichage des points d’intérêt à 20 par page (pagination ou défilement). Utilise le la maquette UI_pointInteret.png dans le fichier src/UIMock. tu dois Suivre a la lettre la structure des elements dans l’image.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | GitHub Copilot — VS Code |
| **Modèle** | Gemini 3.1 Pro (Preview) |

---

### 📦 Sortie obtenue

- Création du composant `PointInteret.jsx` dans `src/pages/` reproduisant la structure de la maquette `UI_pointInteret.png` :
- Import et parsing côté client de `poi.csv` et `territoires.csv` via Vite avec des parser (`parseCSV`, `csvToObjects`).
- Création de la zone tableau (`DataGrid`) avec les différentes colonnes.
- Creation de l'élément UI pour le filtrage d'arrondissement 


### ✏️ Modifications apportées par l’humain

- Aucune

---

### 🧠 Justification

**Accepté** : J’ai accepté les modifications apportées par l’IA, car elles répondaient aux besoins que j’avais spécifiés dans le prompt.

J’ai accepté le filtrage par arrondissement, puisque l’utilisation d’un `useMemo()` qui parcourt l’ensemble des fontaines et conserve uniquement celles correspondant à l’arrondissement sélectionné constitue une solution simple, claire et efficace.

J’ai également accepté l’ajout des fonctions `parseCSV` et `csvToObjects`, car elles sont nécessaires pour lire les fichiers `.csv` et en extraire les informations requises.

Le tableau `DataGrid` contient les bonnes informations et affiche correctement les données demandées.

**Rejeté** : L’ordre des colonnes du tableau `DataGrid` ne correspondait pas à celui attendu.

**Leçon apprise** : Il est préférable de fournir le plus d’informations possible sous forme de texte dans le prompt. Bien que l’IA soit généralement performante pour interpréter des images, elle comprend mieux les exigences lorsqu’elles sont décrites explicitement en texte.

J’ai également constaté que lorsqu’un trop grand nombre d’exigences est inclus dans un seul prompt, l’IA ne génère pas nécessairement tous les éléments demandés. Il peut donc être avantageux de diviser les demandes complexes en plusieurs prompts plus ciblés.


---

## Tâche 12 — Ajustement aux maquettes UI et retrait des éléments non-sollicités (Phase 2 & 3) {#tache-12}

**Auteur** : Youcef Mekki Daouadji - 2026-05-21

### 💬 Prompt

```
Il manque le bouton Nouveau point d’intérêt en haut à droite, et il manque la recherche par nom. L’arrangement du tableau devrait être : Type, Nom, Arrondissement, Intersection, Actions. Le bouton Actions est nommé Carte et ne contient pas d’icône. Il manque aussi le filtre par type à côté de Filtrer par arrondissement. Enfin, le type Fontaine devrait être affiché en bleu.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | GitHub Copilot — VS Code |
| **Modèle** | Gemini 3.1 Pro (Preview) |

---

### 📦 Sortie obtenue

- Ajout de l’élément UI (barre de rechrche ) pour le filtrage par nom.
- Ajout du boutton Nouveau point intérêt.
- Modification du boutton en changeant le texte et enlevant l’icône.
- Ajout du Filtre par type a côté du filtre du filtre arrondissement.
- Re-arrangement des éléments pour suivre la maquette fournie dans l’énonce du laboratoire.  
- Type « Fontaine » affiché en puce bleue (`Chip`).


---

### ✏️ Modifications apportées par l’humain

- Aucune

---

### 🧠 Justification

**Accepté** : 
- J’ai accepté l’ajout du bouton « Nouveau point d'intérêt » en haut à droite, car il correspond à la structure de UI_pointInteret.png celui-ci etant simplement un `Chip`
- J’ai accepté l’affichage du type « Fontaine » en puce bleue (Chip), car la consigne visuelle du prompt est respectée et améliore la lisibilité du tableau sans alourdir le code.
- J’ai accepté l’ajout de la barre de recherche par nom. La liaison du TextField à searchName et son intégration dans filteredData permettent de retrouver rapidement un lieu parmi toutes les fontaines, en complément du filtre par arrondissement.
- J’ai accepté le réarrangement des colonnes du tableau (Type, Nom, Arrondissement, Intersection, Actions), car il corrige le problème signalé en tâche 11 et respecte l’ordre demandé dans le prompt et la maquette.


---
## Tâche 08 — Reseau.jsx : Icone de cercle {#tache-08}

**Auteur** : Justin Maitland - 2026-05-20

### 💬 Prompt

```
<FormControlLabel control={<Checkbox />} label="REV"/> I would like to have a blue circle icon between the checkbox and the label
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | ChatGPT |
| **Modèle** | GPT-5.5 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

```
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircleIcon from "@mui/icons-material/Circle";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

<FormControlLabel
  control={<Checkbox />}
  label={
    <Box display="flex" alignItems="center" gap={1}>
      <CircleIcon sx={{ color: "blue", fontSize: 12 }} />
      <Typography>REV</Typography>
    </Box>
  }
/>
```



---

### ✏️ Modifications apportées par l'humain

- Garde seulement le import suivant : import CircleIcon from "@mui/icons-material/Circle";
- Changement de la couleur pour chaque cercle utilisés
- Changement de la taille pour chaque cercle (18)

---

### 🧠 Justification

J'ai gardé l'allignent proposé, car c'est exactement ce que j'avais besoin. J'ai aussi décider l'icone de cercle de mui, car cela évitais d'ajouter une image d'icone au projet. J'ai changé la couleur pour respecté les couleurs de la maquette. J'ai changé la taille des cercles, car je les trouvais trop petits.

---

## Tâche 09 — Reseau.jsx : Allignement du texte des bouton à gauche {#tache-09}

**Auteur** : Justin Maitland - 2026-05-20

### 💬 Prompt

```
text allign left button mui
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | ChatGPT |
| **Modèle** | GPT-5.5 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

```
<Button
  fullWidth
  sx={{
    justifyContent: "flex-start",
    textAlign: "left",
  }}
>
  LABEL
</Button>
```



---

### ✏️ Modifications apportées par l'humain

- J'ai enlevé le textAllign : left

---

### 🧠 Justification

Je n'arrivais pas à alligner le texte avec un allign left. J'ai réussis avec un justifyContent : "flexStart".

---

## Tâche 10 — Reseau.jsx : Ajout d'une carte dans la page Reseau {#tache-10}

**Auteur** : Justin Maitland - 2026-05-20

### 💬 Prompt

```
I want to add a map component to my react project. I am using MUI
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude |
| **Modèle** | Sonnet 4.6 |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue


There's no single "MUI Map" component — MUI doesn't ship one natively, so you'll pair a mapping library with MUI's styling. Here are the most popular options:

---

## Option 1: `react-leaflet` (free, no API key)

Best for most projects — open source, no billing required.

```bash
npm install react-leaflet leaflet
```

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Typography } from '@mui/material';

export default function MapComponent() {
  return (
    <Paper elevation={3}>
      <Box sx={{ height: 400, width: '100%' }}>
        <MapContainer
          center={[45.5017, -73.5673]} // Montreal
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          <Marker position={[45.5017, -73.5673]}>
            <Popup>You are here</Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Paper>
  );
}
```

> **Note:** If markers appear broken, add this fix for Leaflet's default icon issue:
> ```js
> import L from 'leaflet';
> import markerIcon from 'leaflet/dist/images/marker-icon.png';
> import markerShadow from 'leaflet/dist/images/marker-shadow.png';
> 
> L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });
> ```

---

## Option 2: `@vis.gl/react-google-maps` (Google Maps, requires API key)

Best if you need Google Maps specifically.

```bash
npm install @vis.gl/react-google-maps
```

```jsx
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Box, Paper } from '@mui/material';

export default function MapComponent() {
  return (
    <Paper elevation={3}>
      <Box sx={{ height: 400, width: '100%' }}>
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
          <Map
            defaultCenter={{ lat: 45.5017, lng: -73.5673 }}
            defaultZoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <Marker position={{ lat: 45.5017, lng: -73.5673 }} />
          </Map>
        </APIProvider>
      </Box>
    </Paper>
  );
}
```

---

## Option 3: `react-map-gl` (Mapbox)

Best for highly customized, beautiful maps.

```bash
npm install react-map-gl mapbox-gl
```

```jsx
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

<Map
  initialViewState={{ longitude: -73.5673, latitude: 45.5017, zoom: 13 }}
  style={{ width: '100%', height: 400 }}
  mapStyle="mapbox://styles/mapbox/streets-v11"
  mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
/>
```

---

## Which should I pick?

| | Leaflet | Google Maps | Mapbox |
|---|---|---|---|
| **Cost** | Free | Pay-as-you-go | Free tier available |
| **API Key** | ❌ Not needed | ✅ Required | ✅ Required |
| **Customization** | Medium | Medium | High |
| **Ease of setup** | Easiest | Easy | Medium |

**Leaflet** is the go-to for most projects. Go with **Google Maps** if you need Places/Directions APIs, or **Mapbox** for custom map styles.

---

### ✏️ Modifications apportées par l'humain

- J'ai opté pour l'option 1
- J'ajouté les 2 premiers imports
- J'ai seulement gardé la partie du MapContainer et le TileLayer
- Modification du zoom (changé pour un zoom de 10)

---

### 🧠 Justification

Je suis aller avec l'option 1 parce que c'était l'option utilisé dans l'énoncé et cette option d'utilise pas d'API donc elle est très simple à implémenter. J'ai gardé seulement les imports pour afficher la carte. J'avais seulement besoin des balise pour afficher la carte, donc j'ai garder le MapContainer et le TileLayer. L'exemple pointait sur Montréal comme je voulais, donc j'ai gardé les coordonnées. J'enlevé le marqueur, car je ne voulais pas l'afficher. J'ai modifié le zoom, car je trouvais qu'on voyais pas bien l'ile de Montréal.

---

## Tâche 13 — Reseau.jsx : Changement du comportement de la page sur petit écran {#tache-13}

**Auteur** : Justin Maitland - 2026-05-21

### 💬 Prompt

```
Where in this code does it tell the navbar to use the hamburger on mobile?

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Accueil', path: '/' },
  { label: 'Réseau', path: '/reseau' },
  { label: 'Statistiques', path: '/statistiques' },
  { label: "Points d'intérêt", path: '/points-interet' },
  { label: 'Assistant', path: '/assistant' },
  { label: 'À propos', path: '/a-propos' },
];

export default function Navbar({ activePage }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const linkSx = (label) => ({
    color: activePage === label ? 'primary.main' : 'grey.500',
    mx: 0.5,
    borderBottom: activePage === label ? '2px solid' : '2px solid transparent',
    borderColor: activePage === label ? 'primary.main' : 'transparent',
    borderRadius: 0,
    '&:hover': {
      backgroundColor: 'rgba(45,106,79,0.06)',
      color: 'primary.main',
      borderBottom: '2px solid',
      borderColor: 'primary.main',
    },
  });

  const drawer = (
    <Box sx={{ width: 260 }} role="presentation">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          🚲 MTL Vélo
        </Typography>
      </Box>
      <Divider />
      <List>
        {NAV_LINKS.map(({ label, path }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
              component={Link}
              to={path}
              selected={activePage === label}
              onClick={() => setDrawerOpen(false)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(45,106,79,0.12)',
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                },
              }}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button variant="outlined" color="primary" fullWidth>
          Connexion
        </Button>
        <Button variant="contained" color="primary" fullWidth>
          Inscription
        </Button>
      </Box>
    </Box>
  );

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            flexGrow: { xs: 1, md: 0 },
            mr: { md: 4 },
            textDecoration: 'none',
          }}
        >
          🚲 MTL Vélo
        </Typography>

        {/* Desktop nav links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
          {NAV_LINKS.map(({ label, path }) => (
            <Button key={label} component={Link} to={path} sx={linkSx(label)}>
              {label}
            </Button>
          ))}
        </Box>

        {/* Desktop auth buttons */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button variant="outlined" color="primary">
            Connexion
          </Button>
          <Button variant="contained" color="primary">
            Inscription
          </Button>
        </Box>

        {/* Mobile hamburger */}
        <IconButton
          edge="end"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { md: 'none' }, color: 'primary.main' }}
          aria-label="Ouvrir le menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>
    </AppBar>
  );
}

```

---

### 🛠 Outil & modèle

| Champ | Valeur                          |
|-------|---------------------------------|
| **Outil** | ChatGPT                         |
| **Modèle** | GPT-5.5                         |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

You only need to change this part:

```jsx
<Grid size={4} sx={{textAlign: 'left'}}>
```

to:

```jsx
<Grid
  size={{ xs: 0, md: 4 }}
  sx={{
    textAlign: 'left',
    display: { xs: 'none', md: 'block' },
  }}
>
```

That will:

* hide the filters/sidebar on mobile
* keep it visible on desktop
* leave the map visible

Then make the map take full width on mobile by changing:

```jsx
<Grid size={8}>
```

to:

```jsx
<Grid size={{ xs: 12, md: 8 }}>
```

So the final layout becomes:

```jsx
<Grid container spacing={2}>
  
  {/* Sidebar */}
  <Grid
    size={{ xs: 0, md: 4 }}
    sx={{
      textAlign: 'left',
      display: { xs: 'none', md: 'block' },
    }}
  >
    {/* filters */}
  </Grid>

  {/* Map */}
  <Grid size={{ xs: 12, md: 8 }}>
    <MapContainer
      center={[45.5017, -73.5673]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
    </MapContainer>
  </Grid>

</Grid>
```

You may also want to give the map a fixed mobile height because `height: 100%` sometimes collapses on smaller screens.

Example:

```jsx
<MapContainer
  center={[45.5017, -73.5673]}
  zoom={10}
  style={{
    height: '80vh',
    width: '100%',
  }}
>
```

That usually works much better on phones.

---

### ✏️ Modifications apportées par l'humain

- J'ai seulement utilisé la partie  display: { xs: 'none', md: 'block' }

---

### 🧠 Justification

Je ne comprenais pas comment notre menu Hamburger fonctionnait 
donc j'ai demandé à l'IA. Il m'a expliqué que xs est le comportement 
à avoir pour les petits écran et md pour les ordinateur de bureau. J'ai donc 
utilisé cela pour dire à mon menu de filtre de ne pas occuper d'espace dans le grid
quand on est en mobile et à la carte d'utiliser toute l'espace dans celle-ci.

Pour le menu de filtre :
```jsx
<Grid size={{ xs: 0, md : 4 }} sx={{textAlign: 'left', display: { xs: 'none', md: 'block' }}}>
```

Pour la carte :
```jsx
 <Grid size={{ xs: 12, md : 8 }}>
```

---

## Tâche 14 — Reseau.jsx : Chargement d'un fichier geojson {#tache-14}

**Auteur** : Justin Maitland - 2026-05-21

### 💬 Prompt

```
How to display a geojson file in the console with react
```

---

### 🛠 Outil & modèle

| Champ | Valeur                          |
|-------|---------------------------------|
| **Outil** | ChatGPT                         |
| **Modèle** | GPT-5.5                         |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

If by “display a GeoJSON file in the console with React” you literally mean logging and inspecting the data, the basic pattern is:

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    fetch("/data/map.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log("GeoJSON data:", data);
        setGeojson(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return <div>Check the browser console</div>;
}
```

Place your file like:

```text
public/
  data/
    map.geojson
```

Then open the browser DevTools console.

---

If you actually want to **render the GeoJSON on a map in React**, the most common approach is using [React Leaflet](https://react-leaflet.js.org/?utm_source=chatgpt.com) with [Leaflet](https://leafletjs.com/?utm_source=chatgpt.com).

Example:

```bash
npm install react-leaflet leaflet
```

```jsx
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function MapView() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/data/map.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setGeoData(data);
      });
  }, []);

  return (
    <MapContainer
      center={[45.5017, -73.5673]}
      zoom={10}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geoData && <GeoJSON data={geoData} />}
    </MapContainer>
  );
}
```

That will:

* load the `.geojson` file
* print it in the browser console
* render the features on the map

Useful docs:

* [GeoJSON specification](https://geojson.org/?utm_source=chatgpt.com)
* [React Leaflet GeoJSON example](https://react-leaflet.js.org/docs/example-vector-layers/?utm_source=chatgpt.com)

---

### ✏️ Modifications apportées par l'humain

- J'ai seulement utilisé le premier bout de code
- J'ai changé le nom de quelques variable
- Je n'ai pas utilisé la partie HTML

---

### 🧠 Justification

J'ai fais ce prompt, car je n'arrivais pas à importer le fichier geojson. 
J'ai demandé à l'IA de m'indiquer comment l'afficher dans la console, car à partir
de cela, je savais comment obtenir l'information que je voulais. J'ai seulement
gardé la partie du fetch avec le useEffect, car c'est ce qui me permet d'accéder
aux données. Une autre alternative était de changer l'extension du fichier pour JSON,
mais ce n'était pas vraiment une option, car on aura besoin d'un fichier 
GeoJson pour la carte plus tard. j'aurais pu aussi le charger comme une chaine de caractère, 
mais ça aurait été très difficile de la traiter.

[MISE À JOUR] 

Après une discussion avec un collègue pour l'emplacement du fichier qui n'était pas cohérent avec les autres fichiers
de donnée, je me suis rappeler de la méthode parse JSON. J'ai donc importé le fichier en chaine de caractère
et ensuite j'ai transformé cette chaine em JSON. Cela permet de rester cohérent, de ne pas faire une requête
pour rien et est beacoup plus commun en Web. Je n'ai donc pas utilisé ce que l'IA me proposait.

---

## Tâche 15 — Assistant.jsx : Création de la page Assistant {#tache-15}

**Auteur** : Youcef Mekki Daouadji - 2026-06-01

### 💬 Prompt

```
Agis en tant que développeur front-end expert spécialisé , En utilisant la tech stack du projet MTL velo. Genere la page Assistant dans src/pages/Assistant.jsx. Utilise la mockUI src\UIMock\page_assistant.png pour te guider sur les composante UI. Genere du code qui est facile a faire une revue dessus
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | GitHub Copilot — VS Code |
| **Modèle** | Gemini 3.1 Pro (Preview) |
| **Mode** | Génération de code en une passe |

---

### 📦 Sortie obtenue

Création du composant `Assistant.jsx` dans `src/pages/` reproduisant la maquette :
- Mise en page `display: flex` inspirée de la maquette avec un volet latéral Historique et une zone principale de Chat.
- Utilisation des composants Material-UI (`Container`, `Paper`, `Box`, `Typography`). 
- Ajout de quelques données "dummy" reproduisant celles de l'image.
- Ajout de la route dans `src/App.jsx`.

---

### ✏️ Modifications apportées par l'humain

- Aucune.

---

### 🧠 Justification


**Accepté** : La page générée correspondait à l'image fournie et à la stack MUI du projet. Le code respectait toutes les instructions, il était bien structuré et commenté.L'utilsation des composants MUI pour la generation de l'UI pour avoir une uniformité dans tous le projet. 

**Rejeté**  : La section Historique n’était pas dans la mock UI. 

**Leçon** : Préciser « seulement ce qui est sur la maquette » pour limiter les ajouts inventés par l’IA et ne pas utiliser des mots comme guide toi mais plustot des instruction d'execution

### Hallucinations rencontrées 
L'IA a generer une section non demande qui etait la section historique dans la page assistant pour permettre de de voir l'historique des messages. 

---

## Tâche 16 — Assistant.jsx : Retrait de l'historique {#tache-16}

**Auteur** : Youcef Mekki Daouadji - 2026-06-01

### 💬 Prompt

```
Enleve la section historique car cette partie n'est pas requis. 
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | GitHub Copilot — VS Code |
| **Modèle** | Gemini 3.1 Pro (Preview) |
| **Mode** | Édition ciblée |

---

### 📦 Sortie obtenue

- Suppression de la barre latérale "Historique" dans `src/pages/Assistant.jsx`.
- Modification de la largeur de la zone principale (`maxWidth="lg"` vers `maxWidth="md"`) pour que le chat ne s'étire pas de manière démesurée sur les grands écrans.
- Suppression des données mockées `history` dans le code.

---

### ✏️ Modifications apportées par l'humain

- Aucune.

---

### 🧠 Justification

**Accepté** : Il a fallu retirer la section d’historique dans la barre de conversation, puisqu’elle ne figurait pas dans la maquette (mock UI) fournie à l’IA et ne faisait donc pas partie des livrables attendus.

L’IA a supprimé la composante UI correspondant à la zone latérale de gauche dédiée à l’historique des conversations.

J’ai également accepté la modification de la largeur de la fenêtre de chat afin qu’elle s’adapte mieux aux différents types d’écrans grâce à l’utilisation de `maxWidth="md"`.

La suppression des messages fictifs (mock) liés à l’historique constitue une bonne amélioration de la clarté de l’interface et permet d’éliminer du code non utilisé.


---

## Tâche 17 — Assistant.jsx : Amélioration de la zone de saisie et bulles {#tache-17} 

**Auteur** : Youcef Mekki Daouadji - 2026-06-01

### 💬 Prompt

```
Agis en tant que développeur front-end expert spécialisé , En utilisant la tech stack du projet MTL velo. Dans la page Assistant.jsx ajoute ces suggestions : 
- Alligner le texte des bulles à gauche au lieu de le centrer
- Un bouton pour envoyer
- Possibilité de faire des sauts de ligne dans le textArea
- Avoir un nombre de caractère maximal et un compteur pour l'afficher près du textArea (ex 1/1000)
- Avertissement que c'est du contenu généré par l'IA quelque part dans la page.
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | GitHub Copilot — VS Code |
| **Modèle** | Gemini 3.1 Pro (Preview) |
| **Mode** | Édition ciblée |

---

### 📦 Sortie obtenue

- Modification de l'alignement des bulles de texte pour un alignement à gauche (`textAlign: 'left'`).
- Remplacement du simple `IconButton` par un bouton "Envoyer" clair à côté de la zone de saisie.
- Modification du `TextField` pour qu'il soit multiligne (`multiline`, `minRows`, `maxRows`).
- Ajout d'une limite de caractères (1000) et d'un compteur dynamique (`0/1000`).
- Ajout d'un avertissement sur l'exactitude du contenu généré par l'IA sous le champ de saisie.

---

### ✏️ Modifications apportées par l'humain

- Aucune.

---

### 🧠 Justification

**Accepté** : L'IA a implémenté toutes les suggestions demandées de manière efficace en utilisant les propriétés Material-UI existantes.Les ajouts respectent bien le design du projet.

L'ajout d'un message de mise en garde via un composant `Typography` est une manière très simple d'informer l'utilisateur qu'il interagit avec une IA.

Le compteur de caractères est pertinent pour une interface de chat avec une IA comportant une limite de caractères.

L'ajout d'un bouton permet d'indiquer clairement à l'utilisateur qu'il doit cliquer dessus plutôt que d'utiliser la touche Entrée du clavier.

---

## Tâche 18 — Accessibilité : Correction des contrastes WCAG 2.1 AA {#tache-18}

**Auteur** : Cédrik Letarte - 2026-06-04

### 💬 Prompt

```
Le livrable me demande de vérifier le contraste de couleur afin de respecter
WCAG 2.1 AA. Est-ce que tu peux faire le tour de l'ensemble des pages src/pages/
et de src/theme.js pour vérifier le tout ? Est-ce que tu peux corriger les contrastes et utiliser l'avantage de theme.js?
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude Code — VS Code |
| **Modèle** | Claude Sonnet 4.6 |
| **Mode** | Audit puis correction ciblée |

---

### 📦 Sortie obtenue

Audit complet de toutes les pages et du thème. Quatre paires de couleurs en échec identifiées, trois valeurs distinctes à corriger :

| Fichier | Modification |
|---------|-------------|
| `src/theme.js` | Ajout de `palette.text.muted: '#595959'` — token centralisé pour le texte secondaire accessible (ratio 7.0:1 sur blanc) |
| `src/components/Navbar.jsx` | Liens inactifs : `'grey.500'` (#9e9e9e, 2.68:1 ❌) → `'text.muted'` (7.0:1 ✅) |
| `src/pages/Reseau.jsx` | 4 labels de filtres : `'#919191'` (3.15:1 ❌) → `'text.muted'` (7.0:1 ✅) |
| `src/pages/PointInteret.jsx` | Chip Fontaine : `'#0288d1'` sur `#e3f2fd` (3.38:1 ❌) → `'#01579b'` (6.48:1 ✅) |

---

### ✏️ Modifications apportées par l'humain

- Aucune.

---

### 🧠 Justification

- **Accepté** : J'ai accepté l'ensemble des corrections. L'IA a correctement identifié les trois couleurs défaillantes (#9e9e9e, #919191 et #0288d1) parmi toutes les paires texte/fond présentes dans le projet.

- **Centralisation dans le thème** : L'ajout du token `text.muted` dans `theme.js` est la décision la plus pertinente. Les couleurs `#9e9e9e` (Navbar) et `#919191` (Reseau) servaient le même rôle du texte secondaire discret, mais utilisaient deux valeurs hardcodées différentes. Les regrouper sous un seul token garantit la cohérence et facilite les ajustements futurs.

- **Chip Fontaine hardcodé** : L'IA a choisi de ne pas centraliser la couleur `#01579b` dans le thème, ce qui est justifié : cette couleur est spécifique au type « Fontaine » et ne représente pas un rôle partagé à l'échelle de l'application. La laisser dans `PointInteret.jsx` évite de polluer le thème avec des couleurs purement contextuelles.

---

## Tâche 19 —  {#tache-19} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
Tâche: Création d'un backend Node.js + Express sur http://localhost:8080/ . Aucune configuration CORS est attendue, mais il faut respecter la politique d'origione identique @GTI525 - Livrable 2.pdf  

Entrée: fichier comptage_velo.db, reseau_cyclable.geojson, poi.csv

Sortie attendue: 3 routes API 

GET /gti525/v1/compteurs/:id?debut=YYMMDD&fin=YYMMDD (retourne les passages agrégés par jour pour le compteur :id filtré sur la période demandée)
GET /gti525/v1/pistes (retourne le contenu de reseau_cyclable.geojson)
GET /gti525/v1/pointsdinteret (retourne retourne poi.csv converti en JSON)
GET /gti525/v1/compteurs/: (retourne la collection des compteurs)

Contraintes spécifiques: toutes les requêtes SQL doivent utiliser des paramètres liés (jamais de
concaténation de chaînes). La gestion d'erreurs côté serveur retourne un statut HTTP approprié et un
objet { erreur: "..." }, sans fuite de stack trace au client. les données actuelles se trouve dans /src/data (il est possible de les déplacers dans le backend pour la suite)

À la fin, génère un bloc pour mes réponses textuelles:
  - Prompt utilisé : [le prompt ci-dessus]
  - Résumé de la sortie : [nb lignes, fonctions, ce qu'elles font]
  - Hypothèses faites : [liste]
  - Justification (à compléter par moi) : [laisser vide]
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- backend/package.json	Configuration npm du backend (Express + sql.js)
- backend/server.js	Serveur Express — 4 routes + gestion d'erreurs
- vite.config.js	Proxy Vite /gti525 → localhost:8080

---

### ✏️ Modifications apportées par l'humain

- Modification de la localisation des données

---

### 🧠 Justification

---

## Tâche 18 —  {#tache-18} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
Tâche: Création d'un backend Node.js + Express sur http://localhost:8080/ . Aucune configuration CORS est attendue, mais il faut respecter la politique d'origione identique @GTI525 - Livrable 2.pdf  

Entrée: fichier comptage_velo.db, reseau_cyclable.geojson, poi.csv

Sortie attendue: 3 routes API 

GET /gti525/v1/compteurs/:id?debut=YYMMDD&fin=YYMMDD (retourne les passages agrégés par jour pour le compteur :id filtré sur la période demandée)
GET /gti525/v1/pistes (retourne le contenu de reseau_cyclable.geojson)
GET /gti525/v1/pointsdinteret (retourne retourne poi.csv converti en JSON)
GET /gti525/v1/compteurs/: (retourne la collection des compteurs)

Contraintes spécifiques: toutes les requêtes SQL doivent utiliser des paramètres liés (jamais de
concaténation de chaînes). La gestion d'erreurs côté serveur retourne un statut HTTP approprié et un
objet { erreur: "..." }, sans fuite de stack trace au client. les données actuelles se trouve dans /src/data (il est possible de les déplacers dans le backend pour la suite)

À la fin, génère un bloc pour mes réponses textuelles:
  - Prompt utilisé : [le prompt ci-dessus]
  - Résumé de la sortie : [nb lignes, fonctions, ce qu'elles font]
  - Hypothèses faites : [liste]
  - Justification (à compléter par moi) : [laisser vide]
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- backend/package.json	Configuration npm du backend (Express + sql.js)
- backend/server.js	Serveur Express — 4 routes + gestion d'erreurs
- vite.config.js	Proxy Vite /gti525 → localhost:8080

---

### ✏️ Modifications apportées par l'humain

- Modification de la localisation des données

---

### 🧠 Justification

---

## Tâche 20 —  {#tache-20} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
modifie la page point d'intérêt pour utiliser un fetch GET sur la route  http://localhost:8080/gti525/v1/pointsdinteret qui retourne le poi.csv converti en JSON
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- Supprimé : les deux imports CSV (poi.csv?raw, territoires.csv?raw) et les fonctions parseCSV / csvToObjects
- Ajouté : useEffect qui fait un fetch('/gti525/v1/pointsdinteret') au montage du composant
- Dérivé : la liste des arrondissements est maintenant calculée depuis les données fetched (plus besoin de territoires.csv)
- Ajouté : spinner (CircularProgress) pendant le chargement et une Alert en cas d'erreur

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification


---

## Tâche 21 —  {#tache-21} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
Fait la même chose avec la page statistic et routes faite pour les compteurs
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- Supprimé : import compteurs.csv?raw, fonction parseCSV, et la constante module-level ALL_ROWS
- Ajouté : useEffect qui fetch /gti525/v1/compteurs au montage, avec états loading et error
- getRowId : utilise maintenant row.ID (l'ID unique du compteur) au lieu de row._id synthétique
- rows : filtre sur compteurs (l'état fetchée) plutôt que sur ALL_ROWS
- UI : spinner pendant le chargement, Alert en cas d'erreur — comportement identique au reste

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification


---

## Tâche 22 —  {#tache-22} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
modifie la page réseau pour utiliser les routes API fetch. Nous utilisons la bibliothèques leaflet.  Voici les tâches :

Il faut Tracer les pistes du fichier reseau_cyclable.geojson sur la carte avec une couleur correspondant à leur catégorie (REV, voie partagée, voie protégée, sentier polyvalent). 

Afficher en bas de la carte un panneau récapitulatif dynamique: nombre de pistes visibles,
longueur totale en kilomètres.

 Une fenêtre modale (overlay) doit s'ouvrir au clic sur une icône d'aide et présenter une légende
des catégories de pistes.

Implémenter le filtrage des pistes selon le type de voie (cases à cocher) et selon l'accessibilité 4
saisons (boutons), avec mise à jour en direct du panneau récapitulatif.

Catégorie : REV
Critère : REV_AVANCEMENT_CODE ∈ {'EV', 'PE', 'TR'}
Couleur suggérée : #2AC7DD

Catégorie : Voie partagée
Critère : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE ∈ {1, 3, 8, 9}
Couleur suggérée : #84CA4B

Catégorie : Voie protégée
Critère : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE ∈ {4, 5, 6} et REV_AVANCEMENT_CODE ∉ {'EV', 'PE', 'TR'}
Couleur suggérée : #025D29

Catégorie : Sentier polyvalent
Critère : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE = {7}
Couleur suggérée : #B958D9
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- Supprimé les imports ?raw — remplacé par fetch('/gti525/v1/pistes') avec spinner pendant le chargement Arrondissements dérivés des propriétés ARRONDISSEMENT du GeoJSON fetchée
- Composant GeoJSON de react-leaflet avec style={styleFeature} — colorie chaque segment selon sa catégorie
- getCategory() applique les critères exacts (REV_AVANCEMENT_CODE, AVANCEMENT_CODE, TYPE_VOIE_CODE)
- key={geoJsonKey} force le remontage de la couche quand les filtres changent
- Checkboxes des catégories connectées à checked — calcule filteredFeatures via useMemo
- Radio saison filtre sur SAISON_PISTE (valeurs 3 ou 4)
- Filtre arrondissement sur ARRONDISSEMENT
- anneau récapitulatif — nombre de pistes et km calculés depuis filteredFeatures (mis à jour en direct)
- Modale légende — Dialog MUI ouvert par l'icône HelpOutlineIcon positionnée en haut à droite de la carte


---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification

---

## Tâche 19 —  {#tache-19} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
modifie la page point d'intérêt pour utiliser un fetch GET sur la route  http://localhost:8080/gti525/v1/pointsdinteret qui retourne le poi.csv converti en JSON
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- Supprimé : les deux imports CSV (poi.csv?raw, territoires.csv?raw) et les fonctions parseCSV / csvToObjects
- Ajouté : useEffect qui fait un fetch('/gti525/v1/pointsdinteret') au montage du composant
- Dérivé : la liste des arrondissements est maintenant calculée depuis les données fetched (plus besoin de territoires.csv)
- Ajouté : spinner (CircularProgress) pendant le chargement et une Alert en cas d'erreur

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification


---

## Tâche 20 —  {#tache-20} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
Fait la même chose avec la page statistic et routes faite pour les compteurs
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- Supprimé : import compteurs.csv?raw, fonction parseCSV, et la constante module-level ALL_ROWS
- Ajouté : useEffect qui fetch /gti525/v1/compteurs au montage, avec états loading et error
- getRowId : utilise maintenant row.ID (l'ID unique du compteur) au lieu de row._id synthétique
- rows : filtre sur compteurs (l'état fetchée) plutôt que sur ALL_ROWS
- UI : spinner pendant le chargement, Alert en cas d'erreur — comportement identique au reste

---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification


---

## Tâche 21 —  {#tache-21} 

**Auteur** : Cédrik Letarte - 2026-06-11

### 💬 Prompt

```
modifie la page réseau pour utiliser les routes API fetch. Nous utilisons la bibliothèques leaflet.  Voici les tâches :

Il faut Tracer les pistes du fichier reseau_cyclable.geojson sur la carte avec une couleur correspondant à leur catégorie (REV, voie partagée, voie protégée, sentier polyvalent). 

Afficher en bas de la carte un panneau récapitulatif dynamique: nombre de pistes visibles,
longueur totale en kilomètres.

 Une fenêtre modale (overlay) doit s'ouvrir au clic sur une icône d'aide et présenter une légende
des catégories de pistes.

Implémenter le filtrage des pistes selon le type de voie (cases à cocher) et selon l'accessibilité 4
saisons (boutons), avec mise à jour en direct du panneau récapitulatif.

Catégorie : REV
Critère : REV_AVANCEMENT_CODE ∈ {'EV', 'PE', 'TR'}
Couleur suggérée : #2AC7DD

Catégorie : Voie partagée
Critère : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE ∈ {1, 3, 8, 9}
Couleur suggérée : #84CA4B

Catégorie : Voie protégée
Critère : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE ∈ {4, 5, 6} et REV_AVANCEMENT_CODE ∉ {'EV', 'PE', 'TR'}
Couleur suggérée : #025D29

Catégorie : Sentier polyvalent
Critère : AVANCEMENT_CODE = 'E' et TYPE_VOIE_CODE = {7}
Couleur suggérée : #B958D9
```

---

### 🛠 Outil & modèle

| Champ | Valeur |
|-------|--------|
| **Outil** | Claude — VS Code |
| **Modèle** | Claude Sonnet 4.7 |
| **Mode** | Posez la question avant la modification |

---

### 📦 Sortie obtenue

- Supprimé les imports ?raw — remplacé par fetch('/gti525/v1/pistes') avec spinner pendant le chargement Arrondissements dérivés des propriétés ARRONDISSEMENT du GeoJSON fetchée
- Composant GeoJSON de react-leaflet avec style={styleFeature} — colorie chaque segment selon sa catégorie
- getCategory() applique les critères exacts (REV_AVANCEMENT_CODE, AVANCEMENT_CODE, TYPE_VOIE_CODE)
- key={geoJsonKey} force le remontage de la couche quand les filtres changent
- Checkboxes des catégories connectées à checked — calcule filteredFeatures via useMemo
- Radio saison filtre sur SAISON_PISTE (valeurs 3 ou 4)
- Filtre arrondissement sur ARRONDISSEMENT
- anneau récapitulatif — nombre de pistes et km calculés depuis filteredFeatures (mis à jour en direct)
- Modale légende — Dialog MUI ouvert par l'icône HelpOutlineIcon positionnée en haut à droite de la carte


---

### ✏️ Modifications apportées par l'humain

- Aucune

---

### 🧠 Justification