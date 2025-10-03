#!/usr/bin/env node
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testPermissionMiddleware() {
    console.log('🔐 Test du middleware de permission RBAC');
    console.log('=====================================================');
    
    try {
        console.log('👤 Utilisation d\'un utilisateur standard du seed (role=user, pas d\'admin)');
        
        // Se connecter avec John Doe (utilisateur standard, sans permissions admin/auteur)
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'john@example.com',
            password: 'password123'
        });

        if (loginResponse.status !== 200) {
            console.log(`❌ Connexion echouee: ${loginResponse.status}`);
            console.log('Reponse:', loginResponse.data);
            return;
        }

        // Récupérer les cookies de session
        const setCookieHeaders = loginResponse.headers['set-cookie'];
        const sessionCookie = setCookieHeaders ? setCookieHeaders.find(cookie => 
            cookie.startsWith('connect.sid=')
        ) : null;

        if (!sessionCookie) {
            console.log('❌ Pas de cookie de session trouve');
            return;
        }

        console.log('✅ Authentification reussie');

        // Tester une route nécessitant des permissions (POST /api/authors)
        console.log('\n🧪 Test de la route POST /api/authors (necessite CREATE_AUTHOR)');
        
        try {
            const authorResponse = await axios.post(`${BASE_URL}/api/authors`, {
                name: 'Test Author',
                bio: 'Test biography'
            }, {
                headers: {
                    Cookie: sessionCookie
                }
            });

            console.log(`⚠️ Reponse inattendue: ${authorResponse.status} - L'utilisateur ne devrait pas avoir cette permission`);

        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Permission correctement refusee (403 Forbidden)');
                console.log(`📝 Message: ${error.response.data.message || 'Permission denied'}`);
            } else {
                console.log(`❌ Erreur inattendue: ${error.response?.status || error.message}`);
                console.log(`📝 Details:`, error.response?.data || error.message);
            }
        }

        // Test d'une route accessible (GET /api/books)
        console.log('\n📚 Test de la route GET /api/books (devrait etre accessible)');
        
        try {
            const booksResponse = await axios.get(`${BASE_URL}/api/books`, {
                headers: {
                    Cookie: sessionCookie
                }
            });

            console.log(`✅ Acces autorise: ${booksResponse.status}`);
            console.log(`📊 Livres retournes: ${booksResponse.data.data?.length || 0}`);

        } catch (error) {
            console.log(`❌ Erreur inattendue: ${error.response?.status || error.message}`);
        }

    } catch (error) {
        console.log('❌ Erreur generale:', error.message);
    }
}

testPermissionMiddleware();
