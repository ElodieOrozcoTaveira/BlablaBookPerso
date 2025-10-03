#!/bin/bash

# Script pour lancer les tests d'intégration seulement
echo "🌐 Lancement des tests d'intégration..."

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Aller à la racine du backend
cd "$(dirname "$0")/../.."

# Vérifier que l'environnement Docker est opérationnel
echo -e "${BLUE}🐳 Vérification de l'environnement Docker...${NC}"

if ! docker ps | grep -q "blablabook"; then
    echo -e "${YELLOW}⚠️ Containers Docker non démarrés. Démarrage...${NC}"
    docker-compose -f ../../docker-compose.dev.yml up -d
    sleep 10
fi

# Vérifier que l'API est accessible
echo -e "${BLUE}📡 Vérification de l'API...${NC}"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s -f http://localhost:3000/api/health > /dev/null; then
        echo -e "${GREEN}✅ API accessible${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -e "${YELLOW}⏳ Attente de l'API (${attempt}/${max_attempts})...${NC}"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ API non accessible après ${max_attempts} tentatives${NC}"
    exit 1
fi

# Vérifier que vitest est disponible
if [ ! -f "node_modules/.bin/vitest" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
    npm install
fi

echo -e "${BLUE}🏃 Exécution des tests d'intégration...${NC}"

# Lancer uniquement les tests d'intégration
npx vitest run tests/integration/ \
    --run \
    --no-file-parallelism \
    --maxWorkers=1 \
    --reporter=verbose \
    --config=vitest.config.ts

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests d'intégration sont passés !${NC}"
else
    echo -e "${RED}❌ Certains tests d'intégration ont échoué (code: $exit_code)${NC}"
fi

exit $exit_code
