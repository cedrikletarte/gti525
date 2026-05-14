# 📋 Journal des prompts — MTL Vélo

> Consigne chaque tâche significative réalisée avec assistance IA :
> prompt utilisé · outil & modèle · sortie obtenue · modifications humaines · justification.

---

## Table des matières

| # | Tâche | Date |
|---|-------|-------|
| [01](#tache-01) | Scaffold UI — Navbar, HomePage, thème MUI | 2026-05-14 |
| [02](#tache-02) | Navbar color — Change theme color | 2026-05-14 |

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

| Décision | Raison |
|----------|--------|
| MUI (@mui/material) comme bibliothèque de composants | Composants accessibles et responsives prêts à l'emploi ; évite de réinventer AppBar, Grid, Drawer, etc. Accélère le développement tout en restant cohérent avec les standards Material Design |
| ThemeProvider + theme.js centralisé | Point de vérité unique pour les couleurs, la typographie et les variantes de composants ; un changement dans theme.js se propage à toute l'application sans toucher aux composants individuels |
| CssBaseline inclus dans App.jsx | Normalise les styles navigateur (marges, box-sizing, typographie) de façon cohérente avec le thème MUI, sans fichier CSS global à maintenir |
| Valeurs de stats en props avec fallback | Permet de brancher des données réelles sans modifier le composant |
| Aucun fichier CSS séparé | Cohérence avec l'approche MUI `sx` ; réduit les conflits de spécificité |
| Drawer hamburger plutôt que menu déroulant natif | Meilleure UX mobile, cohérent avec les patterns MUI |
| Contraste WCAG AA (#2d6a4f sur blanc) | Accessibilité obligatoire ; ratio ≈ 5.8:1 ✅ |
| Container maxWidth="lg" | Limite la largeur de lecture sur grands écrans (≈ 1280 px) |

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

| Décision | Raison |
|----------|--------|
| Ajustement des couleurs du Navbar | cohésion des couleurs utilisées dans l'application |

---

