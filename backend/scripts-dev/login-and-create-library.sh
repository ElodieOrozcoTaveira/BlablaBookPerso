#!/bin/bash
# Script de login utilisateur et récupération du token CSRF lié à la session

# 1. Connexion utilisateur (récupère le cookie de session)
curl -s -c cookie-jar.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.dupont@example.com","password":"Azerty42@"}'

# 2. Récupérer le token CSRF lié à la session utilisateur
token=$(curl -s -b cookie-jar.txt http://localhost:3000/api/auth/csrf-token | grep -o '"csrfToken":"[^"]*"' | cut -d '"' -f4)
echo "Token CSRF utilisateur : $token"

# 3. Exemple d'utilisation : création d'une bibliothèque
echo "Création d'une bibliothèque..."
curl -X POST http://localhost:3000/api/libraries \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $token" \
  -d '{"name":"Ma biblio"}' \
  -b cookie-jar.txt
