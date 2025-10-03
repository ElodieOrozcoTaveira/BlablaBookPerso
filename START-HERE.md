# START-HERE

Ce fichier regroupe les commandes essentielles pour démarrer et utiliser le projet Blablabook.

## 1. Installation des dépendances

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Lancer le projet en développement

```bash
# À la racine du projet
# Backend + Frontend + BDD via Docker

docker compose -f docker-compose.dev.yml up --build
```

## 3. Lancer uniquement le backend (hors docker)

```bash
cd backend
npm run dev
```

## 4. Lancer uniquement le frontend (hors docker)

```bash
cd frontend
npm run dev
```

## 5. Lancer les tests

```bash
cd backend
npm run test
```

## 6. Commandes Git utiles

```bash
git status
git pull origin api
git checkout -b <nouvelle-branche>
git add .
git commit -m "Message"
git push origin <nom-branche>
```

## 7. Accès à l'application

- Frontend : http://localhost:5173
- Backend : http://localhost:3000

---

Pour toute question, consultez le README.md ou demandez à l'équipe !
