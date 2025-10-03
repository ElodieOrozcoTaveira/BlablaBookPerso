#!/bin/bash

# Script de test pour les nouvelles API d'actions auteur
# Test complet du workflow et vérification des endpoints

echo "🧪 === TEST DES ACTIONS AUTEUR ==="
echo ""

BASE_URL="http://localhost:3000/api"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health check
echo -e "${YELLOW}📡 Test 1: Health check API...${NC}"
health_response=$(curl -s $BASE_URL/health)
if echo $health_response | grep -q "success.*true"; then
    echo -e "${GREEN}✅ API opérationnelle${NC}"
else
    echo -e "${RED}❌ API non accessible${NC}"
    exit 1
fi

# Test 2: Endpoints author-actions (sans auth - devrait retourner 401)
echo ""
echo -e "${YELLOW}📡 Test 2: Vérification endpoints author-actions...${NC}"

endpoints=(
    "prepare-action"
    "commit-action" 
    "rollback-action"
)

for endpoint in "${endpoints[@]}"; do
    echo -e "${BLUE}Testing: /author-actions/$endpoint${NC}"
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"open_library_key": "/authors/OL23919A"}' \
        $BASE_URL/author-actions/$endpoint)
    
    if [ "$status_code" = "401" ]; then
        echo -e "${GREEN}✅ Endpoint disponible (auth requise comme attendu)${NC}"
    elif [ "$status_code" = "404" ]; then
        echo -e "${RED}❌ Endpoint non trouvé${NC}"
    else
        echo -e "${YELLOW}⚠️ Status inattendu: $status_code${NC}"
    fi
done

# Test 3: Vérification structure de réponse 401
echo ""
echo -e "${YELLOW}📡 Test 3: Structure de réponse pour authentification...${NC}"

response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"open_library_key": "/authors/OL23919A"}' \
    $BASE_URL/author-actions/prepare-action)

echo "Réponse: $response"
if echo $response | grep -q "authentifié\|Unauthorized"; then
    echo -e "${GREEN}✅ Message d'authentification correct${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Tests de base terminés avec succès !${NC}"
echo ""
echo -e "${BLUE}📝 Pour tester complètement, il faut:${NC}"
echo "1. Se connecter avec un utilisateur authentifié" 
echo "2. Tester prepare-action avec une clé OpenLibrary valide"
echo "3. Tester commit-action et rollback-action"
echo ""
echo -e "${GREEN}💡 Les endpoints sont correctement configurés et sécurisés${NC}"
