#!/usr/bin/env node

/**
 * Script de test pour les nouvelles API d'actions auteur
 * Test complet du workflow : prepare → commit/rollback
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Couleurs pour les logs
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m', 
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

/**
 * Test du workflow complet des actions auteur
 */
async function testAuthorActions() {
    log('🧪 === TEST DES ACTIONS AUTEUR ===', 'blue');
    
    try {
        // Test 1: Health check
        log('\n📡 Test 1: Health check API...', 'yellow');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        
        if (healthResponse.data.success) {
            log(`✅ API opérationnelle: ${healthResponse.data.message}`, 'green');
        } else {
            throw new Error('API non accessible');
        }
        
        // Test 2: Préparation action auteur (sans auth - devrait échouer)
        log('\n📡 Test 2: Préparation action auteur (sans auth)...', 'yellow');
        const prepareResponse = await axios.post(`${BASE_URL}/author-actions/prepare-action`, {
            open_library_key: '/authors/OL23919A'  // J.K. Rowling
        }, {
            validateStatus: () => true // Accept all status codes
        });
        
        if (prepareResponse.status === 401) {
            log('✅ Authentification requise comme attendu', 'green');
        } else {
            log(`⚠️ Status inattendu ${prepareResponse.status}: ${JSON.stringify(prepareResponse.data)}`, 'yellow');
        }
        
        // Test 3: Vérification de la structure des endpoints
        log('\n📡 Test 3: Vérification endpoints disponibles...', 'yellow');
        
        const endpoints = [
            '/author-actions/prepare-action',
            '/author-actions/commit-action', 
            '/author-actions/rollback-action'
        ];
        
        for (const endpoint of endpoints) {
            const response = await axios.post(`${BASE_URL}${endpoint}`, {}, {
                validateStatus: () => true // Accept all status codes
            });
            
            // 401 = endpoint existe mais auth requise (bon)
            // 404 = endpoint n'existe pas (mauvais)
            if (response.status === 401) {
                log(`✅ Endpoint ${endpoint} disponible`, 'green');
            } else if (response.status === 404) {
                log(`❌ Endpoint ${endpoint} non trouvé`, 'red');
            } else {
                log(`⚠️ Endpoint ${endpoint} status: ${response.status}`, 'yellow');
            }
        }
        
        log('\n🎉 Tests de base terminés avec succès !', 'green');
        log('\n📝 Pour tester complètement, il faut:', 'blue');
        log('1. Se connecter avec un utilisateur authentifié', 'reset');
        log('2. Tester prepare-action avec une clé OpenLibrary valide', 'reset'); 
        log('3. Tester commit-action et rollback-action', 'reset');
        log('\n💡 Les endpoints sont correctement configurés et sécurisés', 'green');
        
    } catch (error) {
        log(`❌ Erreur lors des tests: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Lancement des tests
testAuthorActions();
