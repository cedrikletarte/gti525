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

---
## Tâche 08 — Reseau.jsx : Icone de cercle {#tache-08}

### 🗂 Contexte

Projet React + Vite **MTL Vélo**. Fichiers existants : `src/App.jsx`, `src/theme.js`, `src/components/Navbar.jsx`, `src/pages/HomePage.jsx`, `src/pages/Statistic.jsx`,  `src/pages/Reseau.jsx (en cours)`.

---

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

### 🗂 Contexte

Projet React + Vite **MTL Vélo**. Fichiers existants : `src/App.jsx`, `src/theme.js`, `src/components/Navbar.jsx`, `src/pages/HomePage.jsx`, `src/pages/Statistic.jsx`,  `src/pages/Reseau.jsx (en cours)`.

---

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

### 🗂 Contexte

Projet React + Vite **MTL Vélo**. Fichiers existants : `src/App.jsx`, `src/theme.js`, `src/components/Navbar.jsx`, `src/pages/HomePage.jsx`, `src/pages/Statistic.jsx`,  `src/pages/Reseau.jsx`.

---

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


### ✏️ Modifications apportées par l'humain

- J'ai opté pour l'option 1
- J'ajouté les 2 premiers imports
- J'ai seulement gardé la partie du MapContainer et le TileLayer
- Modification du zoom (changé pour un zoom de 10)

---

### 🧠 Justification

Je suis aller avec l'option 1 parce que c'était l'option utilisé dans l'énoncé et cette option d'utilise pas d'API donc elle est très simple à implémenter. J'ai gardé seulement les imports pour afficher la carte. J'avais seulement besoin des balise pour afficher la carte, donc j'ai garder le MapContainer et le TileLayer. L'exemple pointait sur Montréal comme je voulais, donc j'ai gardé les coordonnées. J'enlevé le marqueur, car je ne voulais pas l'afficher. J'ai modifié le zoom, car je trouvais qu'on voyais pas bien l'ile de Montréal.

---

## Tâche 11 — Reseau.jsx : Changement du comportement de la page sur petit écran {#tache-11}

### 🗂 Contexte

Projet React + Vite **MTL Vélo**. Fichiers existants : `src/App.jsx`, `src/theme.js`, `src/components/Navbar.jsx`, `src/pages/HomePage.jsx`, `src/pages/Statistic.jsx`,  `src/pages/Reseau.jsx`.

---

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