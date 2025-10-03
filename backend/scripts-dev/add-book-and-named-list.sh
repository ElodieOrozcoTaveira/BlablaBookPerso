#!/bin/bash
# Ajout d'un livre à la bibliothèque et création d'une liste nommée

# 1. Connexion utilisateur (cookie de session)
curl -s -c cookie-jar.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean.dupont@example.com","password":"Azerty42@"}'

# 2. Récupérer le token CSRF lié à la session utilisateur
token=$(curl -s -b cookie-jar.txt http://localhost:3000/api/auth/csrf-token | grep -o '"csrfToken":"[^"]*"' | cut -d '"' -f4)
echo "Token CSRF utilisateur : $token"

# 3. Créer une bibliothèque (récupère l'id)
lib_response=$(curl -s -X POST http://localhost:3000/api/libraries \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $token" \
  -d '{"name":"Ma biblio"}' \
  -b cookie-jar.txt)
id_library=$(echo "$lib_response" | grep -o '"id_library":\s*[0-9]*' | grep -o '[0-9]*')
echo "id_library créé : $id_library"

# 4. Ajouter un livre à la bibliothèque (exemple avec id_book=1)
curl -X POST http://localhost:3000/api/reading-lists \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $token" \
  -d '{"id_library":'$id_library',"id_book":1,"reading_status":"to_read"}' \
  -b cookie-jar.txt

# 5. Créer une liste nommée
curl -X POST http://localhost:3000/api/reading-lists/create-list \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $token" \
  -d '{"id_library":'$id_library',"list_name":"Romans"}' \
  -b cookie-jar.txt

# 6. Ajouter un livre à la liste nommée
curl -X POST http://localhost:3000/api/reading-lists/add-to-list \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $token" \
  -d '{"id_library":'$id_library',"id_book":1,"list_name":"Romans","reading_status":"to_read"}' \
  -b cookie-jar.txt
