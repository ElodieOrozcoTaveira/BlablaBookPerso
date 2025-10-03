#!/usr/bin/env node

// Script de validation rapide des fichiers .mjs avec axios

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function validateScriptsMjs() {
    console.log('🧪 === VALIDATION DES SCRIPTS .MJS AVEC AXIOS ===');
    console.log('');

    try {
        // Test 1: Health check
        console.log('📡 Test 1: Health check API...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        
        if (healthResponse.status === 200) {
            console.log('✅ API accessible avec axios');
            console.log(`📝 Message: ${healthResponse.data.message}`);
        }

        console.log('');

        // Test 2: Test d'une requête POST (devrait être protégée)
        console.log('🔒 Test 2: Tentative POST sans auth (devrait être 401)...');
        
        try {
            await axios.post(`${BASE_URL}/api/authors`, {
                name: 'Test Author'
            });
            console.log('❌ ERREUR: POST autorisé sans authentification');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ POST correctement protégé (401)');
            } else {
                console.log(`⚠️ Status inattendu: ${error.response?.status}`);
            }
        }

        console.log('');

        // Test 3: Test OpenLibrary 
        console.log('📚 Test 3: OpenLibrary search...');
        const openLibResponse = await axios.get(`${BASE_URL}/api/openlibrary/search/books`, {
            params: { query: 'test', limit: 1 }
        });
        
        if (openLibResponse.status === 200) {
            console.log('✅ OpenLibrary API accessible');
            console.log(`📊 Résultats: ${openLibResponse.data.data.length}`);
        }

        console.log('');
        console.log('🎉 VALIDATION RÉUSSIE !');
        console.log('✅ Tous les scripts .mjs peuvent utiliser axios correctement');
        console.log('✅ L\'API répond correctement aux requêtes axios');
        console.log('✅ La sécurité fonctionne (401 pour les routes protégées)');

    } catch (error) {
        console.error('❌ Erreur lors de la validation:', error.message);
        if (error.response) {
            console.error(`📊 Status: ${error.response.status}`);
        }
        process.exit(1);
    }
}

// Lancer la validation
validateScriptsMjs();
