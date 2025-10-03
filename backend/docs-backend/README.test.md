Test postgresql local pour CI

- Lancer les tests d'intégration contre Postgres de test :

  Depuis `backend` :

  ```bash
  npm run test:ci
  ```

  Ce script démarre `docker-compose.test.yml` (depuis la racine), exporte les variables de `.env.test`, exécute `vitest` puis arrête le compose.
