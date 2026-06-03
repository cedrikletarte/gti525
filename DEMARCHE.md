# 📋 Journal des démarcches — MTL Vélo
## Phase 1

## Équipe et parcours

- **Équipe** : 3 - Membres : Cédrik Letarte, Justin Maitland, Youcef Mekki Daouadji
- **Parcours déclaré** : **avec IA**
- **Date de déclaration** : 2026-05-14
- **Justification du choix** : Nous avons choisi le parcours avec IA, car il semble être le parcour qui ressemble le plus à ce qui est utilisé précsentement en industrie.

---

## Table des matières

| # | Décision | Date |
|---|-------|-------|
| [01](#decision-01) | Choix du cadriciel front-end | 2026-05-14 |
| [02](#decision-02) | Choix de la librairie de composants UI | 2026-05-14 |
| [03](#decision-03) | Début de la page Reseau.jsx | 2026-05-26 |
| [04](#decision-04) | Menu de filtre de la page Reseau.jsx | 2026-05-26 |
| [05](#decision-05) | Ajustement des datepicker de la page Reseau | 2026-05-26 |
| [06](#decision-06) | Cacher le menu de filtre en mobile pour la page Reseau | 2026-05-26 |
| [07](#decision-07) | Obtenir la liste d'arrondissement pour le menu dans la page réseau | 2026-05-26 |

---

## Décision 01 - Choix du cadriciel front-end {#decision-01}

**Auteure** : Cédrik Letarte - 2026-05-14

**Problème** : faut-il utiliser un cadriciel (React, Vite, Next.js) ou rester en JavaScript, HTML, CSS pûr ?

**Sources consultées** :
- React.dev, *Creating a React App* - Recommandation de framework plutôt que de React seul.
- Vite.dev, Documentation officielle de Vite (section *Getting started*, section *Why Vite*).

**Alternatives envisagées** :

| Option | Avantages | Inconvénients pour notre contexte |
|---|---|---|
| JS/HTML/CSS pûr | Aucune dépendance, contrôle total, courbe d'apprentissage nulle avec le cours | Pas de gestion de module, rechargement de page à chaque modification, organisation du code moins élégant |
| React | Large communauté, composants réutilisables | courbe d'apprentissage plus élevée, configuration initiale plus complexe |
| Vite | Démarrage instantané, configuration minimale, même avantage que React | Nécessite Node.js, moins adapté si aucun module npm nécessaire |
| Next.js | Rendu côté serveur, routing intégré | Conçu pour des applications full-stack++, très lourd pour des projets simples |

**Choix retenu** : Utilisation du cadriciel Vite

**Justification** :

- Démarrage instantané : Vite render le code source à la demande via les modules ES, rendant le démarrage du serveur très rapide peu importe la taille du projet
- Mise à jour en temps réel : Lorsqu'un fichier est modifié, Vite met à jour uniquement le module sans recharger la page au complet, ce qui accélère le développement
- Intégration de librairies et réutilisabilité du code : L'un des plus grands avantages de l'utilisation d'un cadriciel est la facilité que nous avons d'utiliser les librairies et des composants avec npm. Cela permet d'éviter de réinventer du code logique/visuelle déjà existante par la communauté.

---

## Décision 02 - Choix de la librairie de composants UI {#decision-02}

**Auteure** : Cédrik Letarte - 2026-05-14

**Problème** : quelle librairie de composants UI utiliser pour accélérer le développement de l'interface et assurer une le même style d'apparence d'une page à l'autre ?

**Sources consultées** :
- MUI, Documentation officielle - Présentation des composants et du système de thème.
- MUI, *Getting started* - guide d'installation.
- Tailwind, *Get started with Tailwind CSS* - Guide d'utilisation.

**Alternatives envisagées** :

| Option | Avantages | Inconvénients pour notre contexte |
|---|---|---|
| Tailwind CSS | Très flexible, utilitaire, léger en production, application de styles "in-line" | Courbe d'apprentissage plus élevée, aucun composant préfait |
| MUI | Composants prêts à l'emploi, thème personnalisable | Plus lourd, nécessite d'apprendre la plupart des composants |
| Aucune librairie | Contrôle total sur le style | Temps de développement beaucoup plus long pour des composants comme les tableaux triables et la pagination |

**Choix retenu** : Utilisation de la librairie MUI

**Justification** :

- Composants déjà codé : MUI fournit des composants qui sont déjà disponible à nos besoins (tableaux triables, menus déroulants, pagination), évitant de devoir perdre du temps à devoir le faire nous-mêmes.
- Accessibilité : les composants respectent les standards WCAG 2.1 nécessaire pour le livrable 1.
- Thème personnalisable : MUI permet de définir des couleurs pour l'ensemble de l'application afin de simplifié la cohérence du style entre les pages.

---

## Décision 03 - Début de la page Reseau.jsx {#decision-03}

**Auteur** : Justin Maitland - 2026-05-26

**Sources consultées** :
- MUI, *React Grid* - https://mui.com/material-ui/react-grid/

**Justification** :

Pour débuter cette page, j'ai analyser la page d'accueil (HomePage.jsx) pour me rappeler un peu comment faire du React et comment fonctione MUI. J'ajouté les même imports, le même container, la barre de navigation ansi que le footer. J'ai aussi ajouter la page Reseau à la liste de route qui existait déjà pour notre router. 

Ensuite j'ai consulté cette page pour savoir comment fonctionne les Grid :  https://mui.com/material-ui/react-grid/ 

Une fois que j'ai réussis à placer les sections comme voulu (carte à droite et filtre à gauche), je me suis lancer sur les filtres.

---

## Décision 04 - Menu de filtre de la page Reseau.jsx {#decision-04}

**Auteur** : Justin Maitland - 2026-05-26

**Sources consultées** :
- MUI, *React Checkbox* - https://mui.com/material-ui/react-checkbox/
- MUI, *React Radio Button* - https://mui.com/material-ui/react-radio-button/
- MUI, *React Select* - https://mui.com/material-ui/react-select/
- MUI, *React Button* - https://mui.com/material-ui/react-button/
- MUI, *Date Picker* - https://mui.com/x/react-date-pickers/date-picker/
- W3Schools, *CSS Align* - https://www.w3schools.com/css/css_align.asp

**Justification** :

Afin de savoir comment les différents éléments de formulaire fonctionnent avec MUI, j'ai consulté la documentation officiel de MUI : 

Checkbox : https://mui.com/material-ui/react-checkbox/
Radio : https://mui.com/material-ui/react-radio-button/
Select : https://mui.com/material-ui/react-select/
Button : https://mui.com/material-ui/react-button/
Date Picker : https://mui.com/x/react-date-pickers/date-picker/

J'ai pu remarquer que les formulaires sont créer avec un FormGroup ainsi que des FormControl et des FormControlLabel. Pour le DatePicker, il y avait des dépendance de plus que j'ai du télécharger avec npm : @mui/x-date-pickers et dayjs. J'ai trouvé qu'il fallait ces dépendances, car j'avais une erreur dans la console sans un dateAdapter. J'ai donc analysé les dépendances de la documentation et réalisé qu'il me le manquais. Le reste du travail pour cette section était beacoup d'ajustement de marge, de taille et de couleur pour les différents éléments.

Pour alligner mes DatePicker à l'horizontal, j'ai consulté cette page pour me rappeler comment faire :
https://www.w3schools.com/css/css_align.asp

---

## Décision 05 - Ajustement des datepicker de la page reseau {#decision-05}

**Auteur** : Justin Maitland - 2026-05-26

**Sources consultées** :
- MUI, *Custom Field* - https://mui.com/x/react-date-pickers/custom-field/
- MUI, *Adapters & Locale* - https://mui.com/x/react-date-pickers/adapters-locale/

**Justification** :

Je devais changer la taille des datepicker pour les rendre plus petits. J'ai trouvé cette page qui disait comment modifier leur taille :
https://mui.com/x/react-date-pickers/custom-field/

Je devais aussi changer le format de date pour utiliser des tiret. Cette page de la documentation m'a permis de m'indiquer comment faire :
https://mui.com/x/react-date-pickers/adapters-locale/

---

## Décision 06 - Cacher le menu de filtre en mobile pour la page Reseau {#decision-06}

**Auteur** : Justin Maitland - 2026-05-26

**Sources consultées** :
- React, *Conditional Rendering* - https://react.dev/learn/conditional-rendering
- MUI, *Material Icons* - https://mui.com/material-ui/material-icons/?theme=Sharp&query=expan&selected=ExpandLessSharp

**Justification** :

J'ai regardé comment faire de l'affichage conditionel sur react avec la documentation officiel de React :
https://react.dev/learn/conditional-rendering

Pour le reste, j'ai utilisé un useState afin de garder l'état booléen du menu pour savoir si il est ouvert ou non

Pour l'icone, je l'ai pris dans les icones fournis par MUI ici :
https://mui.com/material-ui/material-icons/?theme=Sharp&query=expan&selected=ExpandLessSharp

---

## Décision 07 - Obtenir la liste d'arrondissement pour le menu dans la page réseau {#decision-07}

**Auteur** : Justin Maitland - 2026-05-26

**Sources consultées** :
- MUI, *React Select* - https://mui.com/material-ui/react-select/

**Justification** :

Je me suis beacoup inspiré de la méthode ParseCSV dans la page statistique et je l'ai adapté pour les arrondissments. Je commence par faire un split sur les sauts de lignes puisque chaque arrondissements est séparé de cette façon. Cela me permet de les séparé en élément de tableau. Ensuite je devais faire un map pour obtenir seulement le premier élément avant la virgule de chaque ligne, car cela correspond au nom de l'établissement et c'est ce que je veux afficher pour les  choix dans mon menu. J'ai terminé par un filtre pour enlever les éléments vide puisque j'avais un élément vide à la fin. Je me suis finalement basé sur cette page de la documentation de MUI pour savoir comment les ajouté au Select :
https://mui.com/material-ui/react-select/
