#!/bin/bash

# Script pour lancer les tests unitaires seulement
echo "🧪 Lancement des tests unitaires..."

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Aller à la racine du backend
cd "$(dirname "$0")/../.."

# Vérifier que vitest est disponible
if [ ! -f "node_modules/.bin/vitest" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
    npm install
fi

echo -e "${BLUE}🏃 Exécution des tests unitaires...${NC}"

# Lancer uniquement les tests unitaires
npx vitest run tests/unit/ \
    --run \
    --no-file-parallelism \
    --maxWorkers=1 \
    --reporter=verbose \
    --config=vitest.unit.config.ts

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests unitaires sont passés !${NC}"
else
    echo -e "${RED}❌ Certains tests unitaires ont échoué (code: $exit_code)${NC}"
fi

exit $exit_code
