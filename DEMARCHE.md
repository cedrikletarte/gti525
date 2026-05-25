# Phase 1

### Parcours
---
Nous avons choisi le parcours avec IA, car il semble être le parcour qui ressemble le plus à ce qui est utilisé précsentement en industrie.

## Démarches

### Tâche 1 : Début de la page Reseau.jsx
Pour débuter cette page, j'ai analyser la page d'accueil (HomePage.jsx) pour me rappeler un peu comment faire du React et comment fonctione MUI. J'ajouté les même imports, le même container, la barre de navigation ansi que le footer. J'ai aussi ajouter la page Reseau à la liste de route qui existait déjà pour notre router. 

Ensuite j'ai consulté cette page pour savoir comment fonctionne les Grid :  https://mui.com/material-ui/react-grid/ 

Une fois que j'ai réussis à placer les sections comme voulu (carte à droite et filtre à gauche), je me suis lancer sur les filtres.

### Tâche 2 : Menu de filtre de la page Reseau.jsx
Afin de savoir comment les différents éléments de formulaire fonctionnent avec MUI, j'ai consulté la documentation officiel de MUI : 

Checkbox : https://mui.com/material-ui/react-checkbox/
Radio : https://mui.com/material-ui/react-radio-button/
Select : https://mui.com/material-ui/react-select/
Button : https://mui.com/material-ui/react-button/
Date Picker : https://mui.com/x/react-date-pickers/date-picker/

J'ai pu remarquer que les formulaires sont créer avec un FormGroup ainsi que des FormControl et des FormControlLabel. Pour le DatePicker, il y avait des dépendance de plus que j'ai du télécharger avec npm : @mui/x-date-pickers et dayjs. J'ai trouvé qu'il fallait ces dépendances, car j'avais une erreur dans la console sans un dateAdapter. J'ai donc analysé les dépendances de la documentation et réalisé qu'il me le manquais. Le reste du travail pour cette section était beacoup d'ajustement de marge, de taille et de couleur pour les différents éléments.

Pour alligner mes DatePicker à l'horizontal, j'ai consulté cette page pour me rappeler comment faire :
https://www.w3schools.com/css/css_align.asp

### Tâche 3 : Ajustement des datepicker de la page reseau

Je devais changer la taille des datepicker pour les rendre plus petits. J'ai trouvé cette page qui disait comment modifier leur taille :
https://mui.com/x/react-date-pickers/custom-field/

Je devais aussi changer le format de date pour utiliser des tiret. Cette page de la documentation m'a permis de m'indiquer comment faire :
https://mui.com/x/react-date-pickers/adapters-locale/

### Tâche 4 : Cacher le menu de filtre en mobile pour la page Reseau

J'ai regardé comment faire de l'affichage conditionel sur react avec la documentation officiel de React :
https://react.dev/learn/conditional-rendering

Pour le reste, j'ai utilisé un useState afin de garder l'état booléen du menu pour savoir si il est ouvert ou non

Pour l'icone, je l'ai pris dans les icones fournis par MUI ici :
https://mui.com/material-ui/material-icons/?theme=Sharp&query=expan&selected=ExpandLessSharp

### Tâche 5 : Obtenir la liste d'arrondissement pour le menu dans la page réseau

Je me suis beacoup inspiré de la méthode ParseCSV dans la page statistique et je l'ai adapté pour les arrondissments. Je commence par faire un split sur les sauts de lignes puisque chaque arrondissements est séparé de cette façon. Cela me permet de les séparé en élément de tableau. Ensuite je devais faire un map pour obtenir seulement le premier élément avant la virgule de chaque ligne, car cela correspond au nom de l'établissement et c'est ce que je veux afficher pour les  choix dans mon menu. J'ai terminé par un filtre pour enlever les éléments vide puisque j'avais un élément vide à la fin. Je me suis finalement basé sur cette page de la documentation de MUI pour savoir comment les ajouté au Select :
https://mui.com/material-ui/react-select/