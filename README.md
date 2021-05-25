![uvsq_logo](https://www.uvsq.fr/medias/photo/logo-uvsq-2020-cmjn_1578589130014-png?ID_FICHE=213209)

# AWS : Warzomb :space_invader:

*Semaine du 20/05/2021*
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

Il faudra sélectionner le mode de jeu ainsi que son personnage parmis un choix de différent rôle pour une meilleure expérience de jeu :

* **Sorcier** : Vie : 1/5  ||  Portée :  3/5 || Déplacement : 1/5 || Attaque : 5/5

* **Epéiste** : Vie : 2/5 || Portée :  1/5 ||  Déplacement : 3/5 || Attaque :  3/5

* **Tank** :    Vie : 5/5 || Portée :  1/5 || Déplacement : 3/5  || Attaque : 1/5

* **Tireur** :  Vie : 1/5  || Portée :  5/5 || Déplacement : 1/5  || Attaque :  3/5

Le jeu se déroulera sur une des 5 cartes au choix :

* **Forest**
* **Cavern**
* **City**
* **Swamp**
* **Desert**

## Gameplay :video_game:

Il sera possible pour l'utilisateur de se connecter ou non, auquel cas il aura accès à son historique de ses anciennes parties ainsi qu'à la gestion de son profil.
Pour jouer, un menu de pré-partie permettra au joueur de créer une partie ou de rejoindre une partie existante.
Afin de créer une partie, un choix parmit les 5 différentes cartes, les 4 différents personnages et les 2 modes de jeu sera fait par le biai du menu de pré-sélection.
