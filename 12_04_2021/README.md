![uvsq_logo](https://www.uvsq.fr/medias/photo/logo-uvsq-2020-cmjn_1578589130014-png?ID_FICHE=213209)

# AWS : Warzomb :space_invader:

*Semaine du 12/04/2021*  
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


## Fonctionnalités :wrench:

Notre application devra intégrer les éléments suivants :  

* Une interface utilisateur permettant les intéractions de base type connexion, inscription, choix du mode de jeu, lancer une partie de jeu, consulter son historique, etc.  
* Un "Shop" pour améliorer ses personnages avec les piéces ammassées durant les parties.  
* Un historique des différentes parties jouées.  
* Une page pour consulter ses informations personnelles et/ou les modifier.  
* *[Optionnel]* Acheter des piéces utilisable dans le shop via l'argent réel.    

## Base de données :cloud:

Pour le projet, nous avons jugé plus pertinent d'utiliser un SGBD relationnel qui suit le modele [Entité-Association](https://fr.wikipedia.org/wiki/Mod%C3%A8le_entit%C3%A9-association) (EA). Le modéle EA permet la manipulation plus aisée des données pour ce type de base de données. Les données sont stockées dans différentes tables Pour le moment voici les différentes tables que comportera le SGBD :

![BDD](https://github.com/serwiz/Warzomb/blob/master/12_04_2021/schema_sgbd_1.png)

## Code :minidisc:

Pour le moment la priorité est à l'organisation et à la préparation des différents modules/Fonctionnalités à implémenter. Nous avons donc décider d'élaborer pour cette semaine les principaux axes du projet :

- Le code HTML et CSS de plusieurs pages
  - Accueil
  - Page du jeu
  - Connexion
  - Inscription
- Un code JavaScript au niveau du Client
- Un code JavaScript au niveau du Serveur
- Intégration de plusieurs fonctionnalités :
  - Le chat
  - Le multijoueurs

À noter que le code est consultable sur le [dépot distant du projet](https://github.com/serwiz/Warzomb) github.

## Ressources :information_source:

Dans cette section se trouve toutes les ressources qui seront / pourront être utilisées pour mettre en place notre projet :

- *Framework Express* : pour le côté serveur
- *Tiled** : Pour élaborer nos maps
- *Socket.io* : module pour la communication entre serveur et client

*(+)[kenney](https://kenney.nl/assets?q=2d) pour les assets de map qui seront utilisés dans Tiled

## Nos questionnement et réponses :ballot_box_with_check:

Nous avons notés les principales questions/problématique que nous nous sommes posée et auquel nous avons essayé de répondre :

- **Choisir un hébergeur d'images** : par exemple Amazon cloud ou autre.

- **Penser à la partie sécurité** : Pour la partie html, 2 modules pour le moments qui sont Yup et DOMPurify. Le premier permet de créer des schémas de vérifications lors d'entrées d'input et le 2 permet de supprimer des éléments d'un input lors de sa sortie. Pour la BDD ?

- On utilisera **une map** obtenu avec Tiled contenant les obstacles puis comment gérer les collisions ?

  - On peut créer polygones représentant des blocs de collisions et chercher naïvement tous les contacts possibles

  - on peut utiliser un QuadTree (ressource dans la bibliographie) mais est-ce "rentable" pour ce qu'on cherche à faire ?

-  **A faire dans l'application** :

  - Chat :
    - option pour voir ou ne pas voir le chat (hide/show)
  - HTML :
    - page de menu de sélection de personnage et de map
    - page de profil
    - page historique
    - footer a remplir (design)
    - rendre le site responsive grâce au query
  - Base de données :
    - lier le site avec une base de données
    - optimiser la base de données
    - sécuriser la base de données
  - Jeu :
    - ajouter des compétences avec leurs icônes
    - 4 map à modéliser encore sur Tiled (on part sur une base de 5)
    - le jeu n'a qu'une classe de perso pour le moment (contre 4 voulues)
    - gérer les collisions
    - ne pas sortir des limites de l'écran
    - objets
    - ennemis
    - objectifs
    - tableau de score


## Inconvénient et limites :construction:

La principale contrainte du projet et pas la moindre est la **contrainte temporelle**. En effet, il est judicieux d'ajouter de nombreuses fonctionnalités, cependant il faut pouvoir assurer la distribution du projet pour la date donnée.  
Il y a également la **contrainte de groupe**, avancer en parallèle en respectant les différents rôles attribuée et compléter les tâches qui nous sont confiées.  
Nous sommes également limité par les différents outils que nous utiliserons ainsi que les performances des machines à disposition, il s'agit de la **contrainte matériel et logiciel**.

## Organisation :round_pushpin:

Avec la pandémie, nous avons mis à notre disposition plusieurs outils de communication pour faciliter au mieux l'interaction entre membres du groupe :

- Un serveur Discord
- Un repository github
- L'IDE Glitch

## Rôles :bust_in_silhouette:

Pour cette semaine, nous avons distribué les rôles comme suit :  

* **Meneur** : Moussa EL HABAR
  - Présentation orale
  - Synthétisation des données
  - Conception de base de données


* **Codeur** : Jeff LIM
  - Client / Serveur
  - HTML :
      - Accueil
      - Page de Jeu
      - Inscription
      - Connexion
  - Intégration du chat
  - Conception de base de données


* **Chercheur** : Aymen CHIHANI
  - Recherches sur la communication Client / Serveur
  - Recherche bibliographique
  - Conception de base de données


* **Rapporteur** : Wissam SERHAN
  - Rédaction du README.md contenant le rapport de la semaine
  - Rédaction du diaporama synthétisant les données du rapport
  - Préparation d'un rapport au format pdf
  - Conception de base de données

Pour les semaines qui suivent nous n'avons pas encore décidé de l'attribution des rôles.

## Bibliographie :blue_book:


C'est ici que vous trouverez les différents sites/archives consultées pour nos différentes recherches.  

* Faire un serveur :

  https://ourcodeworld.com/articles/read/261/how-to-create-an-http-server-with-express-in-node-js

* convertir du HTML en JS

  https://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/

* Comment choisir son moteur de stockage

  https://www.techrepublic.com/article/a-fast-and-furious-guide-to-mysql-database-engines/

* Vérifier les inputs et output d'un utilisateur

  https://linguinecode.com/post/validate-sanitize-user-input-javascript

* QuadTree (optimisation de la gestion des collisions)

  https://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374

* Faire un chat

  https://www.skysilk.com/blog/2018/create-real-time-chat-app-nodejs/

* Attention aux injections JS

  https://owasp.org/www-community/xss-filter-evasion-cheatsheet

  https://stackoverflow.com/questions/44488156/how-to-sanitize-js-and-html-in-inputs
