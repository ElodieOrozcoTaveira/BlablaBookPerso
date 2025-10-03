#!/bin/bash
# Script d'inscription utilisateur avec CSRF et cookie

# 1. Récupérer le token CSRF et le cookie temporaire
token=$(curl -s -c cookie-jar.txt http://localhost:3000/api/auth/csrf-token | grep -o '"csrfToken":"[^"]*"' | cut -d '"' -f4)

# 2. Inscription avec le token CSRF et le cookie
echo "Token CSRF utilisé : $token"
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $token" \
  -d '{
    "firstname": "Jean",
    "lastname": "Dupont",
    "username": "jean_dupond42",
    "email": "jean.dupont@example.com",
    "password": "Azerty42@"
  }' \
  -b cookie-jar.txt
