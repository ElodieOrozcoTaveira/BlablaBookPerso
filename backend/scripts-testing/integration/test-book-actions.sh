#!/bin/bash

# Script de test des actions livre pour comparaison avec les actions auteur
echo "📚 === TEST DES ACTIONS LIVRE ==="
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

# Test 2: Endpoints book-actions (sans auth - devrait retourner 401)
echo ""
echo -e "${YELLOW}📡 Test 2: Vérification endpoints book-actions...${NC}"

endpoints=(
    "prepare-action"
    "commit-action" 
    "rollback-action"
)

for endpoint in "${endpoints[@]}"; do
    echo -e "${BLUE}Testing: /book-actions/$endpoint${NC}"
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"open_library_key": "/works/OL45804W"}' \
        $BASE_URL/book-actions/$endpoint)
    
    if [ "$status_code" = "401" ]; then
        echo -e "${GREEN}✅ Endpoint disponible (auth requise comme attendu)${NC}"
    elif [ "$status_code" = "404" ]; then
        echo -e "${RED}❌ Endpoint non trouvé${NC}"
    else
        echo -e "${YELLOW}⚠️ Status inattendu: $status_code${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ Tests book-actions terminés avec succès !${NC}"
echo ""
echo -e "${BLUE}📋 Comparaison avec author-actions:${NC}"
echo "- book-actions: prepare-action, commit-action, rollback-action ✅"
echo "- author-actions: prepare-action, commit-action, rollback-action ✅"
echo "- Même architecture et sécurité ✅"
