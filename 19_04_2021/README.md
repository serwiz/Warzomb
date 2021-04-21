![uvsq_logo](https://www.uvsq.fr/medias/photo/logo-uvsq-2020-cmjn_1578589130014-png?ID_FICHE=213209)

# AWS : Warzomb :space_invader:

*Semaine du 19/04/2021*
*Groupe 5 :*
- *Moussa EL HABAR*
- *Jeff LIM*
- *Aymen CHIHANI*
- *Wissam SERHAN*

*lien du dépôt github: [Warzomb](https://github.com/serwiz/Warzomb)*

## Introduction :door:

Le but de ce projet est de réaliser une application web en **HTML/CSS/JavaScript** intégrant le front-end et le back-end. Pour cela il conviendra d'utiliser des outils tels que : NodeJs, MongoDB, etc.
Nous avons décider d'élaborer un mini-jeux de rôle en 2D, multijoueurs en ligne appelé **WARZOMB**. Il comportera plusieurs mode de jeux :

* **"Battle - Mélée Générale"** : Tous contre tous, les joueurs doivent effectuer le plus grand nombre d'éliminations en évitant le plus possible de mourir. Au bout d'un certain temps la partie s'arrête et le joueur ayant le meilleur ratio élimination/mort l'emporte. De 2 à 6 joueurs

* **"Survie"** : Le joueur doit survivre le plus longtemps possible, dans un environnement ouvert 2D, contre des vagues de zombie de plus en plus fort. Il doit effectuer le plus d'élimination possible.

* **"Survie - Hardcore"** : À l'image de la Survie classique, il faudra tenir le plus longtemps possible contre une horde de zombie en tout genre dans un envrionnement 2D restreint. De 1 à 2 joueurs.

Il faudra sélectionner le mode de jeu ainsi que son personnage parmis un choix de différent rôle pour une meilleure expérience de jeu :

* **Sorcier** : Vie : 1/5  ||  Portée :  3/5 || Déplacement : 1/5 || Attaque : 5/5

* **Epéiste** : Vie : 2/5 || Portée :  1/5 ||  Déplacement : 3/5 || Attaque :  3/5

* **Tank** :    Vie : 5/5 || Portée :  1/5 || Déplacement : 3/5  || Attaque : 1/5

* **Tireur** :  Vie : 1/5  || Portée :  5/5 || Déplacement : 1/5  || Attaque :  3/5


## Code :minidisc:

Cette semaine, la continuité du code prend la forme suivante :

- Liaison entre le site et la BBD pour authentifier les utilisateurs :
  - Connexion
  - Inscription
  - Page profil
- Création d'une base de données avec firebase et liaison au serveur 
- Amélioration du jeu :
  - Limitation
  - Apparition d'ennemis 
  - Overlay : Pseudo, PDV, Score...
  - Ajout d'images
  - Historique de jeu
  - Ajout d'un pré-menu de séléction (En développement)
  - Création d'une nouvelle carte
- Sécurité : Prévention d'injection JavaScript dans le chat du jeu coté serveur 

À noter que le code est consultable sur le [dépot distant du projet](https://github.com/serwiz/Warzomb) github.

## Ressources :information_source:

Dans cette section se trouve toutes les ressources qui seront / pourront être utilisées pour mettre en place notre projet :

- Glitch, VScode pour coder
- Tiled pour les dessins de map
- Express pour gérer la partie serveur (Pour le moment)
- Mysql Workbench pour la partie base de données
- Socket.io pour la communication serveur/client
- Sequelize pour coder la gestion des BDD


## Inconvénient et Amélioration :gear:

Nous avons listés quelques uns des inconvénients rencontrés ainsi que les améliorations pouvant répondre aux problèmes créés :
- Design : Amélioration des maps, des projectiles, des personnages...
- Sécurité : Rajouter des couches de sécurité. Quelles sont nos limites ?
- Performance : Diviser l'affichage en plusieurs affichage pour optimiser l'affichage des données uniquement.



## Organisation :round_pushpin:

Avec la pandémie, nous avons mis à notre disposition plusieurs outils de communication pour faciliter au mieux l'interaction entre membres du groupe :

- Un serveur Discord
- Un repository github
- L'IDE Glitch

## Rôles :bust_in_silhouette:

Pour cette semaine, nous avons distribué les rôles comme suit :

* **Responsable** : Wissam SERHAN
  - Organisation et réunion
  - Préparation de la présentation
  - Synthétisation des données 


* **Codeur** : Moussa EL HABAR
  - Création de la basede donnée
  - Liaison Base de données et Serveur
  - Ajout de fonctionnalités de jeu et améliorations 
  

* **Chercheur** : Jeff LIM
  - Recherches des différentes ressources nécessaires au projet
  - Réponses à nos différentes problématiques
  - Recherche d'optimisation et d'amélioration 


* **Rapporteur** : Aymen CHIHANI
  - Rédaction du rapport
  - Préparation du diaporama


## Bibliographie :blue_book:

- Se familiariser avec socket-io et javascript pour jeu en ligne https://modernweb.com/building-multiplayer-games-with-node-js-and-socket-io/

- Faire un formulaire avec nodejs
https://medium.com/swlh/read-html-form-data-using-get-and-post-method-in-node-js-8d2c7880adbf

- Convertisseur HTML to JS syntax
https://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/

- Choisir son moteur de stockage
https://www.techrepublic.com/article/a-fast-and-furious-guide-to-mysql-database-engines/

- JQuery
    - https://jquery.com/
    - https://www.yogihosting.com/jquery-cdn/ qu'est ce que jquery CDN
    - https://www.yogihosting.com/what-is-cdn-content-delivery-network/
    

- Yup pour créer des schéma de validations
- DOMPurify
https://linguinecode.com/post/validate-sanitize-user-input-javascript

- un herbergeur d'images (amazon cloud par exemple)

- KeyCode for moves
http://javascriptkeycode.com/

- Dossier qui parle d'une optimisation pour gérer les collisions
https://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374

- Chat
https://www.skysilk.com/blog/2018/create-real-time-chat-app-nodejs/

- Page d'inscription basique en javascript
https://medium.com/swlh/how-to-create-your-first-login-page-with-html-css-and-javascript-602dd71144f1

- Prévention injection
https://owasp.org/www-community/xss-filter-evasion-cheatsheet
https://stackoverflow.com/questions/44488156/how-to-sanitize-js-and-html-in-inputs

- Firebase tuto pour créer un systeme de connexion
https://www.youtube.com/watch?v=-OKrloDzGpU&t=328s
https://firebase.google.com/

- Firebase
faire une page de connexion avec mail et config prédéfinie cote client
https://firebase.google.com/docs/auth/web/firebaseui

- Aide pour afficher des valeurs dynamiquement dans un tableau HTML (non utilisé pour le moment)
https://developer.mozilla.org/fr/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces

- Sprites personnages
https://craftpix.net/freebies/filter/sprites/page/2/
