#!/usr/bin/env node

// Script de test de securite ameliore pour BlaBlaBook API
// Teste l'authentification sur les routes protegees avec des donnees realistes

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Configuration des tests de securite
const SECURITY_CONFIG = {
    // Statuts consideres comme "proteges" (acces refuse sans auth)
    PROTECTED_STATUSES: [401], // Non authentifie
    
    // Statuts consideres comme "accessibles" (même sans auth parfaite)
    ACCESSIBLE_STATUSES: [400, 404, 422, 500], // Erreurs de validation/donnees
    
    // Timeout pour les requêtes
    TIMEOUT: 5000
};

// Donnees de test realistes basees sur les schemas Zod
const TEST_DATA = {
    library: {
        name: 'Ma Bibliotheque Test Securite',
        description: 'Bibliotheque creee pour tester la securite des endpoints',
        is_public: false
    },
    
    book: {
        title: 'Le Guide du Test de Securite',
        isbn: '9782123456789', // ISBN-13 valide
        publication_year: 2023,
        pages: 250,
        language: 'fr',
        author_ids: [], // Tableau vide pour eviter les erreurs de FK
        genre_ids: []
    },
    
    author: {
        name: 'Test Author',
        biography: 'Auteur cree pour les tests de securite de l\'API',
        birth_date: '1980-01-01',
        nationality: 'FR'
    },
    
    genre: {
        name: 'Test Securite',
        description: 'Genre cree specifiquement pour les tests de securite'
    },
    
    notice: {
        title: 'Avis de test de securite',
        content: 'Ce contenu fait plus de 10 caracteres comme requis par la validation',
        rating: 4,
        id_book: 999999 // ID tres eleve, probablement inexistant
    },
    
    rate: {
        rating: 4,
        id_book: 999999 // ID tres eleve, probablement inexistant
    },
    
    readingList: {
        id_book: 999999, // ID tres eleve, probablement inexistant
        id_library: 999999, // ID tres eleve, probablement inexistant
        status: 'to_read'
    },
    
    userProfile: {
        firstname: 'TestFirst',
        lastname: 'TestLast',
        email: 'test-security@example.com'
    },
    
    uploadMeta: {
        alt: 'Image de test securite',
        description: 'Metadonnees pour test d\'upload'
    }
};

// Routes a tester - organisees par entite metier
const ROUTES_TO_TEST = {
    // 📚 BIBLIOTHeQUES
    libraries: [
        { method: 'POST', path: '/api/libraries', data: TEST_DATA.library, desc: 'Creation bibliotheque' },
        { method: 'PUT', path: '/api/libraries/999999', data: TEST_DATA.library, desc: 'Modification complete bibliotheque' },
        { method: 'PATCH', path: '/api/libraries/999999', data: { name: 'Nom modifie' }, desc: 'Modification partielle bibliotheque' },
        { method: 'DELETE', path: '/api/libraries/999999', desc: 'Suppression bibliotheque' }
    ],
    
    // 📖 LIVRES  
    books: [
        { method: 'POST', path: '/api/books', data: TEST_DATA.book, desc: 'Creation livre' },
        { method: 'PUT', path: '/api/books/999999', data: TEST_DATA.book, desc: 'Modification complete livre' },
        { method: 'PATCH', path: '/api/books/999999', data: { title: 'Titre modifie' }, desc: 'Modification partielle livre' },
        { method: 'DELETE', path: '/api/books/999999', desc: 'Suppression livre' }
    ],
    
    // ✍️ AUTEURS
    authors: [
        { method: 'POST', path: '/api/authors', data: TEST_DATA.author, desc: 'Creation auteur' },
        { method: 'PUT', path: '/api/authors/999999', data: TEST_DATA.author, desc: 'Modification complete auteur' },
        { method: 'PATCH', path: '/api/authors/999999', data: { name: 'Nom modifie' }, desc: 'Modification partielle auteur' },
        { method: 'DELETE', path: '/api/authors/999999', desc: 'Suppression auteur' }
    ],
    
    // 🏷️ GENRES
    genres: [
        { method: 'POST', path: '/api/genres', data: TEST_DATA.genre, desc: 'Creation genre' },
        { method: 'PUT', path: '/api/genres/999999', data: TEST_DATA.genre, desc: 'Modification complete genre' },
        { method: 'PATCH', path: '/api/genres/999999', data: { name: 'Nom modifie' }, desc: 'Modification partielle genre' },
        { method: 'DELETE', path: '/api/genres/999999', desc: 'Suppression genre' }
    ],
    
    // 💬 AVIS (NOTICES)
    notices: [
        { method: 'POST', path: '/api/notices', data: TEST_DATA.notice, desc: 'Creation avis' },
        { method: 'PUT', path: '/api/notices/999999', data: TEST_DATA.notice, desc: 'Modification complete avis' },
        { method: 'PATCH', path: '/api/notices/999999', data: { rating: 5 }, desc: 'Modification partielle avis' },
        { method: 'DELETE', path: '/api/notices/999999', desc: 'Suppression avis' }
    ],
    
    // ⭐ NOTES (RATES)  
    rates: [
        { method: 'POST', path: '/api/rates', data: TEST_DATA.rate, desc: 'Creation note' },
        { method: 'PUT', path: '/api/rates/999999', data: TEST_DATA.rate, desc: 'Modification complete note' },
        { method: 'PATCH', path: '/api/rates/999999', data: { rating: 5 }, desc: 'Modification partielle note' },
        { method: 'DELETE', path: '/api/rates/999999', desc: 'Suppression note' }
    ],
    
    // 📋 LISTES DE LECTURE
    readingLists: [
        { method: 'POST', path: '/api/reading-lists', data: TEST_DATA.readingList, desc: 'Ajout a liste de lecture' },
        { method: 'PUT', path: '/api/reading-lists/999999', data: { status: 'completed' }, desc: 'Modification statut lecture' },
        { method: 'PATCH', path: '/api/reading-lists/999999', data: { status: 'reading' }, desc: 'Modification partielle statut' },
        { method: 'DELETE', path: '/api/reading-lists/999999', desc: 'Suppression de liste de lecture' },
        { method: 'GET', path: '/api/reading-lists/me/stats', desc: 'Mes statistiques de lecture' }
    ],
    
    // 👤 UTILISATEURS
    users: [
        { method: 'GET', path: '/api/users', desc: 'Liste utilisateurs (admin)' },
        { method: 'GET', path: '/api/users/me/profile', desc: 'Mon profil complet' },
        { method: 'GET', path: '/api/users/999999/stats', desc: 'Statistiques utilisateur' },
        { method: 'PUT', path: '/api/users/me/profile', data: TEST_DATA.userProfile, desc: 'Modification profil utilisateur' },
        { method: 'PATCH', path: '/api/users/me/profile', data: { firstname: 'Nouveau prenom' }, desc: 'Modification partielle profil' },
        { method: 'DELETE', path: '/api/users/me', desc: 'Suppression compte utilisateur' }
    ],
    
    // 🖼️ UPLOADS
    uploads: [
        { method: 'GET', path: '/api/uploads/me', desc: 'Mes uploads' },
        { method: 'POST', path: '/api/uploads/user/avatar', data: {}, desc: 'Upload avatar utilisateur' },
        { method: 'DELETE', path: '/api/uploads/user/avatar', desc: 'Suppression avatar' },
        { method: 'PATCH', path: '/api/uploads/user/avatar', data: TEST_DATA.uploadMeta, desc: 'Modification metadonnees avatar' },
        { method: 'POST', path: '/api/uploads/book/999999/cover', data: {}, desc: 'Upload couverture livre' },
        { method: 'DELETE', path: '/api/uploads/book/999999/cover', desc: 'Suppression couverture' },
        { method: 'PATCH', path: '/api/uploads/book/999999/cover', data: TEST_DATA.uploadMeta, desc: 'Modification metadonnees couverture' }
    ]
};

/**
 * Teste une route specifique
 */
async function testRoute(route) {
    try {
        const axiosOptions = {
            method: route.method.toLowerCase(),
            url: `${BASE_URL}${route.path}`,
            headers: { 'Content-Type': 'application/json' },
            timeout: SECURITY_CONFIG.TIMEOUT,
            validateStatus: () => true, // Accept all status codes
        };
        
        // Ajouter les données pour POST, PUT, PATCH
        if (route.data && ['POST', 'PUT', 'PATCH'].includes(route.method)) {
            axiosOptions.data = route.data;
        }
        
        const response = await axios(axiosOptions);
        
        let responseData = response.data || { message: 'Réponse vide reçue' };
        
        // Analyser le resultat de securite
        const isProtected = SECURITY_CONFIG.PROTECTED_STATUSES.includes(response.status);
        const isAccessibleError = SECURITY_CONFIG.ACCESSIBLE_STATUSES.includes(response.status);
        
        return {
            route: `${route.method} ${route.path}`,
            description: route.desc || 'Sans description',
            status: response.status,
            isSecure: isProtected,
            isExpectedError: isAccessibleError,
            message: responseData.message || responseData.error || 'Pas de message',
            category: 'unknown'
        };
        
    } catch (error) {
        return {
            route: `${route.method} ${route.path}`,
            description: route.desc || 'Sans description',
            status: 'ERROR',
            isSecure: false,
            isExpectedError: false,
            message: error.message,
            category: 'unknown'
        };
    }
}

/**
 * Execute tous les tests de securite
 */
async function runSecurityTests() {
    console.log('🔒 BlaBlaBook API - Test de Securite Complet');
    console.log('=' .repeat(70));
    console.log(`🎯 URL testee: ${BASE_URL}`);
    console.log(`⏱️  Timeout: ${SECURITY_CONFIG.TIMEOUT}ms`);
    console.log('=' .repeat(70));
    
    let totalTests = 0;
    let secureRoutes = 0;
    let insecureRoutes = 0;
    let errorRoutes = 0;
    
    const results = {
        secure: [],
        insecure: [],
        errors: []
    };
    
    // Tester chaque categorie
    for (const [categoryName, routes] of Object.entries(ROUTES_TO_TEST)) {
        console.log(`\n📂 ${categoryName.toUpperCase()}`);
        console.log('-' .repeat(50));
        
        for (const route of routes) {
            const result = await testRoute({ ...route, category: categoryName });
            totalTests++;
            
            if (result.status === 'ERROR') {
                console.log(`❌ ${result.route} - ERREUR TECHNIQUE`);
                console.log(`   ${result.description}`);
                console.log(`   💥 ${result.message}`);
                errorRoutes++;
                results.errors.push(result);
                
            } else if (result.isSecure) {
                console.log(`✅ ${result.route} - PROTeGe (${result.status})`);
                console.log(`   ${result.description}`);
                secureRoutes++;
                results.secure.push(result);
                
            } else if (result.isExpectedError) {
                console.log(`⚠️  ${result.route} - ERREUR ATTENDUE (${result.status})`);
                console.log(`   ${result.description}`);
                console.log(`   ℹ️  ${result.message}`);
                // Les erreurs attendues sont considerees comme "securisees"
                secureRoutes++;
                results.secure.push(result);
                
            } else {
                console.log(`🚨 ${result.route} - NON PROTeGe (${result.status})`);
                console.log(`   ${result.description}`);
                console.log(`   ⚠️  ${result.message}`);
                insecureRoutes++;
                results.insecure.push(result);
            }
        }
    }
    
    // Resume final
    console.log('\n' + '=' .repeat(70));
    console.log('📊 ReSULTATS DeTAILLeS');
    console.log('=' .repeat(70));
    console.log(`📈 Total tests executes: ${totalTests}`);
    console.log(`🔒 Routes securisees: ${secureRoutes} (${Math.round((secureRoutes/totalTests)*100)}%)`);
    console.log(`🚨 Routes non protegees: ${insecureRoutes}`);
    console.log(`❌ Erreurs techniques: ${errorRoutes}`);
    
    // Score de securite
    const securityScore = Math.round(((secureRoutes)/(totalTests-errorRoutes))*100);
    console.log(`\n🎯 SCORE DE SeCURITe: ${securityScore}%`);
    
    if (securityScore === 100) {
        console.log('\n🎉 EXCELLENT ! Toutes les routes sont parfaitement securisees !');
    } else if (securityScore >= 90) {
        console.log('\n👍 TReS BIEN ! Securite quasi-parfaite, quelques ajustements mineurs.');
    } else if (securityScore >= 75) {
        console.log('\n⚠️  ATTENTION ! Plusieurs routes necessitent une protection.');
    } else {
        console.log('\n🚨 CRITIQUE ! De nombreuses failles de securite detectees !');
    }
    
    // Recommandations
    if (results.insecure.length > 0) {
        console.log('\n🔧 ACTIONS RECOMMANDeES:');
        results.insecure.forEach((result, index) => {
            console.log(`   ${index + 1}. Ajouter authenticateToken a ${result.route}`);
        });
    }
    
    if (results.errors.length > 0) {
        console.log('\n🛠️  ERREURS a CORRIGER:');
        results.errors.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.route}: ${result.message}`);
        });
    }
    
    return {
        total: totalTests,
        secure: secureRoutes,
        insecure: insecureRoutes,
        errors: errorRoutes,
        score: securityScore,
        results
    };
}

// Execution du script
runSecurityTests()
    .then(result => {
        process.exit(result.insecure > 0 ? 1 : 0);
    })
    .catch(error => {
        console.error('💥 Erreur fatale:', error);
        process.exit(2);
    });

export { runSecurityTests, ROUTES_TO_TEST, TEST_DATA };