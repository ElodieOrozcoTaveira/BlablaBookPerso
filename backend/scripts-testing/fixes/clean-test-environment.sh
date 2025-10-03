#!/bin/bash

# Script pour nettoyer l'environnement de test
echo "🧹 Nettoyage de l'environnement de test..."

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗑️ Suppression des fichiers temporaires...${NC}"

# Supprimer les fichiers temporaires de test
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "/tmp/vitest_run.log" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true

# Nettoyer le cache de vitest
echo -e "${YELLOW}🧹 Nettoyage du cache vitest...${NC}"
rm -rf node_modules/.vitest 2>/dev/null || true

# Nettoyer le cache de jest (si il y en a)
rm -rf node_modules/.cache 2>/dev/null || true

# Nettoyer les coverage reports
echo -e "${YELLOW}📊 Nettoyage des rapports de coverage...${NC}"
rm -rf coverage/ 2>/dev/null || true

# Nettoyer les builds de test
echo -e "${YELLOW}🔨 Nettoyage des builds temporaires...${NC}"
rm -rf dist-test/ 2>/dev/null || true

# Vérifier que l'environnement Docker est opérationnel
echo -e "${BLUE}🐳 Vérification de l'environnement Docker...${NC}"

if ! docker ps | grep -q "blablabook"; then
    echo -e "${YELLOW}⚠️ Containers Docker non démarrés. Démarrage...${NC}"
    docker-compose -f ../../docker-compose.dev.yml up -d
    sleep 5
fi

# Vérifier que l'API est accessible
echo -e "${BLUE}📡 Vérification de l'API...${NC}"
if curl -s -f http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ API accessible${NC}"
else
    echo -e "${YELLOW}⚠️ API non accessible, attente...${NC}"
    sleep 10
    if curl -s -f http://localhost:3000/api/health > /dev/null; then
        echo -e "${GREEN}✅ API accessible après attente${NC}"
    else
        echo -e "${RED}❌ API toujours non accessible${NC}"
    fi
fi

echo -e "${GREEN}✅ Environnement de test nettoyé et prêt !${NC}"
