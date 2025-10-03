#!/bin/bash

# Script principal pour lancer tous les tests de BlaBlaBook
echo "🚀 === SUITE COMPLÈTE DE TESTS BLABLABOOK ==="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Aller à la racine du script
cd "$(dirname "$0")"

# Variables pour compter les succès/échecs
total_tests=0
passed_tests=0
failed_tests=0

# Fonction pour exécuter un script et compter le résultat
run_script() {
    local script_path="$1"
    local description="$2"
    local is_critical="${3:-false}"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🏃 $description${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ -x "$script_path" ]; then
        "$script_path"
        exit_code=$?
        
        total_tests=$((total_tests + 1))
        
        if [ $exit_code -eq 0 ]; then
            echo -e "${GREEN}✅ $description - RÉUSSI${NC}"
            passed_tests=$((passed_tests + 1))
        else
            echo -e "${RED}❌ $description - ÉCHOUÉ (code: $exit_code)${NC}"
            failed_tests=$((failed_tests + 1))
            
            # Si c'est critique, on s'arrête
            if [ "$is_critical" = "true" ]; then
                echo -e "${RED}💥 Test critique échoué - Arrêt de la suite${NC}"
                exit $exit_code
            fi
        fi
    else
        echo -e "${YELLOW}⚠️ Script $script_path non trouvé ou non exécutable${NC}"
        failed_tests=$((failed_tests + 1))
        total_tests=$((total_tests + 1))
    fi
    
    echo ""
    sleep 1
}

# Afficher l'entête
echo -e "${CYAN}🧪 Suite de tests complète pour BlaBlaBook Backend${NC}"
echo -e "${BLUE}📅 $(date)${NC}"
echo ""

# Étape 1: Nettoyage et préparation (critique)
run_script "./fixes/clean-test-environment.sh" "Nettoyage de l'environnement" "true"

# Étape 2: Correction des problèmes connus
run_script "./fixes/fix-duplicate-imports.sh" "Correction des imports en double" "false"
run_script "./fixes/fix-test-mocks.sh" "Correction des mocks de test" "false"

# Étape 3: Tests unitaires (critique)
run_script "./runners/run-unit-tests.sh" "Tests unitaires" "false"

# Étape 4: Tests d'intégration (critique pour les containers)
run_script "./runners/run-integration-tests.sh" "Tests d'intégration" "false"

# Étape 5: Tests de permissions et sécurité
run_script "./runners/run-permission-tests.mjs" "Tests de permissions RBAC" "false"

# Étape 6: Tests d'intégration API
run_script "./integration/test-author-actions.sh" "Test des actions auteur (API)" "false"
run_script "./integration/test-book-actions.sh" "Test des actions livre (API)" "false"
run_script "./integration/test-security.mjs" "Tests de sécurité réalistes" "false"

# Afficher le résumé final
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RÉSUMÉ FINAL${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${BLUE}Total des tests: ${total_tests}${NC}"
echo -e "${GREEN}Tests réussis: ${passed_tests}${NC}"
echo -e "${RED}Tests échoués: ${failed_tests}${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS ! 🎉${NC}"
    echo -e "${GREEN}✨ L'application BlaBlaBook est prête pour la production ✨${NC}"
    exit 0
else
    percentage=$((passed_tests * 100 / total_tests))
    echo -e "${YELLOW}⚠️ Taux de réussite: ${percentage}%${NC}"
    
    if [ $percentage -ge 80 ]; then
        echo -e "${YELLOW}✅ Taux de réussite acceptable (≥80%)${NC}"
        exit 0
    else
        echo -e "${RED}❌ Taux de réussite insuffisant (<80%)${NC}"
        exit 1
    fi
fi
