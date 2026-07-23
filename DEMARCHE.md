# 📋 Journal des démarcches — MTL Vélo
## Phase 1

## Équipe et parcours

- **Équipe** : 3 - Membres : Cédrik Letarte, Justin Maitland, Youcef Mekki Daouadji
- **Parcours déclaré** : **avec IA**
- **Date de déclaration** : 2026-05-14
- **Justification du choix** : Nous avons choisi le parcours avec IA, car il semble être le parcour qui ressemble le plus à ce qui est utilisé précsentement en industrie.

---

## Table des matières

| #                  | Décision                                                                      | Date       |
|--------------------|-------------------------------------------------------------------------------|------------|
| [01](#decision-01) | Choix du cadriciel front-end                                                  | 2026-05-14 |
| [02](#decision-02) | Choix de la librairie de composants UI                                        | 2026-05-14 |
| [03](#decision-03) | Début de la page Reseau.jsx                                                   | 2026-05-26 |
| [04](#decision-04) | Menu de filtre de la page Reseau.jsx                                          | 2026-05-26 |
| [05](#decision-05) | Ajustement des datepicker de la page Reseau                                   | 2026-05-26 |
| [06](#decision-06) | Cacher le menu de filtre en mobile pour la page Reseau                        | 2026-05-26 |
| [07](#decision-07) | Obtenir la liste d'arrondissement pour le menu dans la page réseau            | 2026-05-26 |
| [08](#decision-08) | Gestion des noms de propriétés différentes entre pois et compteurs            | 2026-06-25 |
| [09](#decision-09) | Ouverture d'un graphique quand on appuie sur passage, avec un filtre par date | 2026-06-28 |
| [10](#decision-10) | Authentification locale vs OAuth | 2026-07-07 |
| [11](#decision-11) | Stratégie de calcul des pistes populaires (SQL vs applicatif) | 2026-07-07 |

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

Pour débuter cette page, j'ai analyser la page d'accueil (HomePage.jsx) pour me rappeler un peu comment faire du React et comment fonctione MUI. J'ajouté les même imports, le même container, la barre de navigation ainsi que le footer. J'ai aussi ajouter la page Reseau à la liste de route qui existait déjà pour notre router. 

Ensuite j'ai consulté cette page pour savoir comment fonctionne les Grid :  https://mui.com/material-ui/react-grid/ 

Une fois que j'ai réussis à placer les sections comme voulu (carte à droite et filtre à gauche), je me suis lancer sur les filtres.

Une alternative aurait été d'utiliser le display grid en CSS sur des box, mais selon moi c'était plus cohérent et plus simple d'utiliser les grid de MUI.

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

Une alternative aurait été d'utiliser les balises classique disponible en HTML, mais les éléments offert par MUI venait avec une belle apparence dès le départ ainsi que des props utile. Je jugeais également que c'était plus cohérent. Si on voudrait plus tard des éléments plus personnaliser, on pourrait partir d'élément HTML de base et les modifier à souhait, mais pour l'instant ceux-ci font très bien l'affaire.

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

J'ai esssayé plusieurs autres alternative comme changer la taille du texte par exemple, mais je n'était pas capable d'écraser la classe CSS qui l'affectait. J'ai vu rapidement en ligne qu'il faut modifier une classe special nommé MuiPickersPopper-root pour le faire, mais je trouvais que l'apparence small offert par MUI offrait quand même de bon résultats, donc je ne suis pas aller plus loin et c'était plus facile à comprendre dans le code.

Je devais aussi changer le format de date pour utiliser des tiret. Cette page de la documentation m'a permis de m'indiquer comment faire :
https://mui.com/x/react-date-pickers/adapters-locale/

Il y avait plusieurs options, mais j'ai choisi cette apadateur, car il est utiliser dans l'exemple de la documentation et ils se ressemblent tous.

---

## Décision 06 - Cacher le menu de filtre en mobile pour la page Reseau {#decision-06}

**Auteur** : Justin Maitland - 2026-05-26

**Sources consultées** :
- React, *Conditional Rendering* - https://react.dev/learn/conditional-rendering
- MUI, *Material Icons* - https://mui.com/material-ui/material-icons/?theme=Sharp&query=expan&selected=ExpandLessSharp

**Justification** :

J'ai regardé comment faire de l'affichage conditionel sur react avec la documentation officiel de React :
https://react.dev/learn/conditional-rendering

Selon la documentation, je devrais utiliser un état pour savoir si je retourne le composant ou non, mais j'ai plutôt décider de faire un display none en mode grand écran, car je trouvais que c'était plus simple de faire la gestion de la taille d'écran de cette façon. Un désavantage est que le composant existe toujours donc ça pourrait être potentiellement problématique, donc je le changerai si cela cause des problème plus tard.

Pour le reste, j'ai utilisé un useState afin de garder l'état booléen du menu pour savoir si il est ouvert ou non. Je ne voyais pas l'intérêt de faire autrement et c'est plus cohérent avec les pratiques utilisés en React et avec notre menu hamburger qui utilisait déjà cette logique.

Pour l'icone, je l'ai pris dans les icones fournis par MUI ici :
https://mui.com/material-ui/material-icons/?theme=Sharp&query=expan&selected=ExpandLessSharp

Par cohérence encore, j'ai choisis leur icône au lieux d'en prendre une sur fontawesome par exemple.

---

## Décision 07 - Obtenir la liste d'arrondissement pour le menu dans la page réseau {#decision-07}

**Auteur** : Justin Maitland - 2026-05-26

**Sources consultées** :
- MUI, *React Select* - https://mui.com/material-ui/react-select/

**Justification** :

Je me suis beacoup inspiré de la méthode ParseCSV dans la page statistique et je l'ai adapté pour les arrondissments. Je commence par faire un split sur les sauts de lignes puisque chaque arrondissements est séparé de cette façon. Cela me permet de les séparé en élément de tableau. Ensuite je devais faire un map pour obtenir seulement le premier élément avant la virgule de chaque ligne, car cela correspond au nom de l'établissement et c'est ce que je veux afficher pour les  choix dans mon menu. J'ai terminé par un filtre pour enlever les éléments vide puisque j'avais un élément vide à la fin. Je me suis finalement basé sur cette page de la documentation de MUI pour savoir comment les ajouté au Select :
https://mui.com/material-ui/react-select/

Une alternative aurait été d'utiliser une librairie externe pour s'en charger, mais puisque c'était un fichier très simple, j'ai décidé de le faire moi même pour éviter d'importer une autre librairie. Se fier sur son propre code offre plus de contrôle et empêche des problèmes de dépendance et de mise à jour qui pourrait survenir.

## Décision 08 - Gestion des noms de propriétés différentes entre pois et compteurs {#decision-08}

**Auteur** : Justin Maitland - 2026-06-25

**Justification** :

J'ai rencontrer un problème dans la selection du marqueur par défault lorsqu'on ouvre la carte interactive.
Le problème était que les compteurs et les points d'intérêts ont des noms de 
propriété différentes alors que j'utilisais une syntaxe adapté à ceux des compteurs
dans InteractiveMap.jsx. J'ai commencé par tenté de changer les noms de propriétés
pour qu'ils soivent tous pareille, mais je me suis rendu compte que ce m'était pas une bonne solution,
car ce n'est pas toujours possible. J'ai donc eu l'idée d'ajouter un prop pour le nom
de la propriété id et nom afin de les accéder dynamiquement.

Avant :
```jsx
       {markers.map((c) =>
            <MapMarker
                key={c.ID}
                obj={c}
                selected={c.ID === selectedMarker?.ID}


            />
```

Après :
```jsx
        {markers.map((c) =>
    <MapMarker
        key={c[markerIdField]}
        obj={c}
        selected={c[markerIdField] === selectedMarker?.[markerIdField]}
        nameField={markerNameField}
        idField={markerIdField}
    />
)}
```
Avec cette solution, il sera possible d'utiliser le nom désiré pour ces propriétés. 

Cependant après une plus longue réflexion, j'ai eu l'idée de ne pas utiliser cette idée
et de plutôt envoyer un nouveau tableau modifier par un map qui utiliserait plutot
afin de pouvoir mettre les nom de propriétés que je voulais.

Résultat final pour poi par exemple :
```jsx
    <InteractiveMap
        center={[selectedPoi?.Latitude, selectedPoi?.Longitude]}
        zoom={20}
        markers = {filteredData.map((m) => ({
            ID: m.id,
            Nom: m.Nom,
            Latitude: m.Latitude,
            Longitude: m.Longitude,
        }))}
        selectedMarker={selectedPoi?.id}
    />
```

J'ai aussi décider de faire la comparaison sur le id plutôt que sur l'objet complet
finalement, car selon moi c'est mieu et évite de gérer les problème de référence.

## Décision 09 - | [09](#decision-09) | Ouverture d'un graphique quand on appuie sur passage, avec un filtre par date | 2026-06-28 | {#decision-09}

**Auteur** : Justin Maitland - 2026-06-28

**Justification** :

Pour débuter cette tâche, je devais trouver une librairie de graphique. Il y en avait quelques-unes proposé dans 
l'énoncé, mais en faisant des recherches, j'ai trouvé que MUI, qu'on utilise dans notre projet,
possède des graphiques. J'ai donc opté pour cette solution en suivant les étapes
sur la documentation pour l'implémenter.

Documentation de react-charts de MUI : https://mui.com/x/react-charts/quickstart/

Sur cette même âge, il y avait un exemple de graphique qui resssemblait à ce que je voulais
comme résultat. J'ai donc pris ce code pour l'adapter et j'ai mis le tout dans le 
fichier Chart.js, un composant réutilisable pour notre projet.

Code initial : 
```jsx
import Box from '@mui/material/Box';
import { BarPlot } from '@mui/x-charts/BarChart';
import { LineHighlightPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartsContainer } from '@mui/x-charts/ChartsContainer';

import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';
import alphabetStock from '../dataset/GOOGL.json';

const series = [
  {
    type: 'bar',
    yAxisId: 'volume',
    label: 'Volume',
    color: 'lightgray',
    data: alphabetStock.map((day) => day.volume),
    highlightScope: { highlight: 'item' },
  },
  {
    type: 'line',
    yAxisId: 'price',
    color: 'red',
    label: 'Low',
    data: alphabetStock.map((day) => day.low),
    highlightScope: { highlight: 'item' },
  },
  {
    type: 'line',
    yAxisId: 'price',
    color: 'green',
    label: 'High',
    data: alphabetStock.map((day) => day.high),
  },
];

export default function Combining() {
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ChartsContainer
        series={series}
        xAxis={[
          {
            id: 'date',
            data: alphabetStock.map((day) => new Date(day.date)),
            scaleType: 'band',
            valueFormatter: (value) => value.toLocaleDateString(),
            height: 48,
          },
        ]}
        yAxis={[
          { id: 'price', scaleType: 'linear', position: 'left', width: 50 },
          {
            id: 'volume',
            scaleType: 'linear',
            position: 'right',
            valueFormatter: (value) => `${(value / 1000000).toLocaleString()}M`,
            width: 55,
          },
        ]}
      >
        <ChartsAxisHighlight x="line" />
        <BarPlot />
        <LinePlot />
        <LineHighlightPlot />
        <ChartsXAxis
          label="Date"
          axisId="date"
          tickInterval={(value, index) => {
            return index % 30 === 0;
          }}
          tickLabelStyle={{
            fontSize: 10,
          }}
        />
        <ChartsYAxis
          label="Alphabet Stock Price (USD)"
          axisId="price"
          tickLabelStyle={{ fontSize: 10 }}
        />
        <ChartsYAxis
          label="Volume"
          axisId="volume"
          tickLabelStyle={{ fontSize: 10 }}
        />
        <ChartsTooltip />
      </ChartsContainer>
    </Box>
  );
}
```

Pour notre cas, on avait besoin d'un axe pour les jours et un autre pour le nombre de passage.
J'ai donc changer les nom, garder une série et enlever l'axe y en trop. J'ai aussi ajouter un prop
afin de pouvoir passer des données au composant. Par la suite, j'ai pratiquement
suivi ce que j'avais fais pour le bouton carte afin d'ouvrir un dialogue avec le graphique
et fournir le bon compteur. Cependant j'ai du faire quelques modifications.

Au lieu de regarder si le compteur selectionner est vide, j'ai décidé d'utiliser
un state pour afin de savoir si le panneau est ouvert. C'était nécessaire, car
un compteur est selectionner quand on appui sur passage, donc il me fallait une
logique différente pour ne pas ouvrir a la fois la carte et le grapgique.

J'ai aussi ajouter une fonction pour chacun des boutons, car je devais faire
plus que changer un seul état. 

Pour le formulaire de date, j'ai résutilié le visuel qu'on avait dans la page Reseau.

Pour obtenir les passages, je fais un fetch quand on appui sur passage avec le id
du compteur dans la ligne du tableau. J'ai ensuite une autre function pour le
bouton du formulaire de date qui va faire un fetch, mais avec les 2 dates.
Pour la gestion d'erreur, j'ai décider de créer un autre état pour le graphique
parce ce que sinon l'erreur aurait été afficher sous le graphique.

Une alternative pour les passage aurait été de faire une seul fetch et d'ensuite
filtrer selon les dates, mais puisqu'on avait une route avec des paramettres pour
ça, j'ai procédé comme cela. De plus ça accélère la chargement  initial de la page.

---

## Décision 10 - Authentification locale (courriel/mot de passe + JWT) plutôt qu'OAuth {#decision-10}

**Auteur** : Cédrik Letarte - 2026-07-07

**Problème** : quel mécanisme d'authentification mettre en place pour protéger les routes d'écriture (POST, PUT, DELETE) sur `/pointsdinteret` : une authentification locale (courriel + mot de passe gérés par notre propre base) ou une délégation à un fournisseur OAuth (Google, GitHub, etc.) ?

**Sources consultées** :
- jsonwebtoken (npm), documentation officielle - signature et vérification de jetons JWT en Node.js.
- bcryptjs (npm), documentation officielle - hachage de mots de passe sans dépendance native.
- Auth0, *OAuth 2.0 and OpenID Connect Overview* - fonctionnement d'un flux OAuth (redirection, callback, jeton d'accès émis par un tiers).

**Alternatives envisagées** :

| Option | Avantages | Inconvénients pour notre contexte |
|---|---|---|
| OAuth (Google, GitHub, etc.) | Aucune gestion de mot de passe de notre côté, sécurité déléguée à un fournisseur de confiance, expérience "Se connecter avec..." familière | Nécessite l'enregistrement d'une application cliente chez le fournisseur, gestion de callback URLs et de secrets supplémentaires, complexité disproportionnée pour protéger une seule ressource (CRUD des points d'intérêt) |
| Authentification locale + session serveur | Simple à comprendre, pas de bibliothèque de signature de jeton nécessaire | Nécessite de garder un état de session côté serveur (mémoire ou store partagé), ce qui va à l'encontre du style sans état déjà utilisé pour le reste de notre API REST |
| Authentification locale + JWT | Sans état (le serveur ne stocke rien après l'émission), standard largement utilisé pour sécuriser des API REST, contrôle total sur le schéma `utilisateurs` | Un jeton émis ne peut pas être révoqué avant son expiration sans mettre en place une liste noire supplémentaire |

**Choix retenu** : authentification locale, avec une table `utilisateurs` (courriel unique, mot de passe haché) et émission d'un jeton JWT signé à la connexion, vérifié par un middleware (`requireAuth`) sur les routes protégées.

**Justification** :

- Le livrable ne demandait de protéger qu'une seule ressource (les mutations sur `/pointsdinteret`). Mettre en place OAuth aurait ajouté une dépendance externe complète (inscription de l'application chez un fournisseur, gestion de callback URLs, secrets supplémentaires) pour un besoin en réalité très limité.
- Le JWT est sans état, ce qui est cohérent avec le reste de notre API REST : chaque requête protégée porte sa propre preuve d'authentification dans l'en-tête `Authorization: Bearer ...`, sans qu'on ait besoin de maintenir une session côté serveur.
- J'ai choisi bcryptjs plutôt qu'argon2 parce qu'il est écrit en JavaScript pur, sans dépendance native à compiler. Cela simplifie le déploiement sur différentes plateformes (Windows en développement, conteneur Linux potentiellement en production) sans avoir à se soucier de la compatibilité des binaires. Le nombre de rounds a été fixé à 10, ce qui est la valeur recommandée pour un bon compromis sécurité/performance.
- La durée de vie du jeton a été fixée à 24h, un compromis entre la sécurité (limiter la fenêtre d'exploitation d'un jeton volé) et l'expérience utilisateur (éviter une reconnexion trop fréquente), tel que suggéré par l'énoncé du livrable.
- Le secret utilisé pour signer les jetons (`JWT_SECRET`) est chargé depuis une variable d'environnement (`.env`, exclu du dépôt via `.gitignore`) plutôt que codé en dur dans le code, afin qu'aucun secret ne se retrouve dans l'historique Git.

---

## Décision 11 - Stratégie de calcul des pistes populaires : agrégation SQL plutôt que calcul applicatif {#decision-11}

**Auteur** : Cédrik Letarte - 2026-07-07

**Problème** : comment déterminer, pour une période donnée, les trois arrondissements les plus achalandés (ratio Σ passages / N compteurs) et ne retourner que les pistes cyclables qui les traversent, sans violer la contrainte du livrable exigeant que le filtrage et la pagination soient délégués à la base plutôt qu'appliqués sur des collections complètes chargées en mémoire ?

**Sources consultées** :
- MariaDB, documentation officielle - clauses `GROUP BY`, `JOIN` et fonctions d'agrégation (`SUM`, `COUNT(DISTINCT ...)`).
- mysql2 (npm), documentation - requêtes paramétrées avec un nombre variable de valeurs (`IN (?, ?, ...)`).

**Alternatives envisagées** :

| Option | Avantages | Inconvénients pour notre contexte |
|---|---|---|
| Charger tous les compteurs, passages et pistes puis calculer le ratio et filtrer en mémoire côté serveur | Logique simple à écrire, aucun SQL complexe à maintenir | Viole directement la contrainte du livrable interdisant le filtrage applicatif sur des collections complètes chargées en mémoire ; ne passe pas à l'échelle avec des dizaines de milliers de lignes de passages |
| Deux requêtes SQL séquentielles : (1) agrégation du ratio passages/compteurs par arrondissement pour obtenir le top 3, (2) sélection des pistes dont l'arrondissement normalisé fait partie de ce top 3 | Chaque requête reste simple et lisible individuellement ; le filtrage et l'agrégation restent entièrement délégués à la base ; réutilise la fonction `normArr()` déjà existante pour réconcilier les noms d'arrondissement entre les tables | Deux allers-retours à la base au lieu d'un seul ; couplage implicite entre les deux requêtes (le résultat de la première alimente le `WHERE ... IN (?)` de la seconde) |
| Une seule requête SQL combinant l'agrégation et la sélection des pistes (sous-requête ou CTE à trois tables) | Un seul aller-retour à la base | Requête beaucoup plus complexe à lire et à maintenir ; jointure entre trois tables (`passages`, `compteurs`, `pistes`) avec normalisation de texte (accents, tirets, articles) difficile à exprimer proprement en SQL pur |

**Choix retenu** : deux requêtes SQL séquentielles - une agrégation (`JOIN passages/compteurs`, `GROUP BY arrondissement`, tri par ratio décroissant, `LIMIT 3`), suivie d'une sélection des pistes (`WHERE norm_arr IN (?, ?, ?)`).

**Justification** :

- La contrainte du livrable est respectée : les deux requêtes délèguent entièrement le filtrage et l'agrégation à MariaDB. Aucune collection complète n'est chargée en mémoire côté Node.js.
- Séparer le calcul en deux requêtes plutôt qu'une seule requête complexe garde chaque étape testable et lisible indépendamment. Cela m'a aussi permis de réutiliser directement la fonction `normArr()` déjà écrite pour normaliser les noms d'arrondissement (accents, tirets, articles), nécessaire puisque la table `compteurs` et la table `pistes` n'utilisent pas exactement la même orthographe pour désigner un même secteur.
- J'ai géré explicitement un cas limite : si aucun arrondissement n'a de passages enregistrés sur la période demandée, la première requête retourne un résultat vide et je retourne immédiatement une `FeatureCollection` GeoJSON vide, plutôt que de laisser la seconde requête s'exécuter avec une clause `IN ()` vide, ce qui aurait pu produire une erreur SQL ou un comportement ambigu selon le moteur.
- Une requête combinée unique aurait réduit le nombre d'allers-retours à la base, mais j'ai jugé que la lisibilité et la facilité de test de deux requêtes simples valaient mieux qu'un gain de performance marginal pour ce volume de données, surtout pour une fonctionnalité qui n'est pas appelée à haute fréquence.
