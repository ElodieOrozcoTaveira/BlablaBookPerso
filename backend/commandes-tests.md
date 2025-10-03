# BACKEND

🚀 Commandes Terminal BlaBlaBook

  📂 Position : /backend

## D'abord se placer dans le bon dossier

  cd backend

  Tests & Sécurité (depuis /backend)

## Tests Jest (tous les tests unitaires + intégration)

  npm run test

## Test de sécurité (script amélioré par entités)

  node src/scripts/test-security.js

## Tests spécifiques

  npm run test:models     # Tests des modèles uniquement
  npm run test:db         # Tests de base de données

## Base de Données (depuis /backend)

## Scripts de gestion DB

  npm run db:create       # Créer la base
  npm run db:seed         # Peupler avec données test
  npm run db:reset        # Reset complet

  Développement (depuis /backend)

## Démarrer en mode dev

  npm run dev

## Build production

  npm run build
  npm start

## Linting et vérification

  npm run lint            # Vérifier le code
  npm run lint:fix        # Corriger automatiquement
  npm run typecheck       # Vérification TypeScript

  📂 Position : / (racine projet)

## Docker (depuis la racine du projet)

  cd ..  # Si vous êtes dans /backend

## Démarrer tous les services

  docker compose -f docker-compose.dev.yml up -d

## Redémarrer seulement l'API

  docker compose -f docker-compose.dev.yml restart api

## Voir les logs

  docker compose -f docker-compose.dev.yml logs api

## Arrêter tout

  docker compose -f docker-compose.dev.yml down
