# BlaBlaBook 📚

![LogoBBB](./conception/logoBBB.png)

_Projet d'apothéose afin de conclure en beauté notre formation avec l'Ecole Oclock, et en vue d'obtenir le Titre Professionnel de Concepteur Développeur d'Applications 🎓_

## **BlablaBook ?** _quézaco??_

...une plateforme de gestion de bibliothèque personnelle, pour des passionés de lecture souhaitant créer du lien autour des livres.

Lecteurs confirmés ou novices, tous peuvent gérer leur biliothèque personnelle, découvrir de nouveaux livres et partages leurs avis.🗨️


## Équipe et Organisation 👥💻

**Équipe** : 4 développeurs concepteurs +

**Durée totale du projet** : 3 semaines +

**Méthodologie** : Agile avec sprints de 2 semaines +🏁

**Présentation de l'équipe** :

- **Lucas** : LeadDev / Concepteur-Développeur Frontend
- **Elodie** : ScrumMaster / Conceptrice-Développeuse FrontEnd
- **Jonathan**: Designer / Concepteur-Développeur BackEnd
- **Stéphane**: DevOps/ Développeur Back-End

**Le Cahier des charges📔 est visualisable dans le repo**

## Lancement du projet avec Docker

### Prérequis

- Docker
- Docker Compose
- Pour lancer les services sans Docker il faut avoir sur le host Node.js ≥ 18

### Installation (avec Docker)

Depuis la racine du projet :

```npm run docker:install```

Ce script installe les dépendances dans les conteneurs (***pour le backend***).

### Démarrer l’environnement de développement

```npm run docker:dev```

Cela va :
- Lancer le frontend sur http://localhost:5173
- Lancer le backend sur http://localhost:3000
- Monter automatiquement les volumes pour le hot reload

### Rebuild (en cas de changement majeur)

```npm run docker:buil```

Reconstruit tous les conteneurs avec --no-cache.

### Nettoyage complet

```npm run docker:clean```

- Stoppe les conteneurs
- Supprime les volumes Docker
- Nettoie le cache Docker

### Conteneurs lancés

|Service |Port local |Dossier associé              |
|--------|----------|------------------------------|
|frontend|	localhost:5173	|./frontend            |
|backend |	localhost:3000	|./backend.            |
|db.     |	localhost:5432	|docker-compose.dev.yml|
|db.     |	localhost:5432	|docker-compose.dev.yml|

### Scripts disponibles (depuis la racine)

***Script	Description***

- ```npm run lint```	Lint frontend et backend
- ```npm run lint:fix```	Lint + fix
- ```npm run docker:dev```	Lance le projet en mode dev avec Docker
- ```npm run docker:build```	Rebuild sans cache
- ```npm run docker:clean```	Stoppe tout + nettoie
- ```npm run docker:shell```	Ouvre un shell dans le conteneur backend
- ```npm run docker:install``` Installe les dépendances dans le backend (peut être dupliqué pour le front si besoin)

## Configuration NGINX – Blablabook

### 🔍 Objectif

Servir le frontend statique (SPA) et proxyfier les appels à l’API backend dans tous les environnements (dev, staging, prod).

### 📁 Fichiers

- `nginx.conf` : config principale (workers, gzip, includes…)
- `default.conf` : config serveur (HTTPS, proxy, routes frontend)
- `ssl/` : contient les certificats auto-signés pour localhost

### ⚙️ Comportement

- Le frontend (SPA) est servi depuis `/usr/share/nginx/html`
- L’API est accessible via `/api/` grâce à un reverse proxy vers le conteneur `api:3000`
- Les erreurs 404/500 affichent des pages dédiées
- Le HTTPS est activé avec des certificats auto-signés (pour test local)

### 🚀 Utilisation

#### En local avec Docker

Assurez-vous d’avoir généré le build de l’app :

```bash
cd client
npm run build
