#!/usr/bin/env node
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testPermissionMiddleware() {
    console.log('🔐 Test du middleware de permission RBAC');
    console.log('=====================================================');
    
    try {
        console.log('👤 Utilisation d\'un utilisateur standard du seed (role=user, pas d\'admin)');
        
        // Se connecter avec John Doe (utilisateur standard, sans permissions admin/auteur)
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'john@example.com',
                password: 'password123'
            })
        });

        if (loginResponse.status !== 200) {
            console.log(`❌ Connexion echouee: ${loginResponse.status}`);
            console.log('Reponse:', await loginResponse.text());
            return;
        }

        // 3. Recuperer les cookies de session
        const setCookieHeaders = loginResponse.headers.raw()['set-cookie'];
        const sessionCookie = setCookieHeaders ? setCookieHeaders.find(cookie => 
            cookie.startsWith('connect.sid=')
        ) : null;

        if (!sessionCookie) {
            console.log('❌ Pas de cookie de session trouve');
            return;
        }

        console.log('✅ Authentification reussie');

        // 4. Tester une route necessitant des permissions (POST /api/authors)
        console.log('\n🧪 Test de la route POST /api/authors (necessite CREATE_AUTHOR)');
        
        const createAuthorResponse = await fetch(`${BASE_URL}/api/authors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookie
            },
            body: JSON.stringify({
                name: 'Test Author Permission',
                bio: 'Auteur pour test de permission'
            })
        });

        console.log(`📊 Status: ${createAuthorResponse.status}`);
        
        if (createAuthorResponse.status === 403) {
            console.log('✅ MIDDLEWARE PERMISSION FONCTIONNE ! (403 = permission refusee)');
            const body = await createAuthorResponse.json();
            console.log('Reponse:', body);
        } else if (createAuthorResponse.status === 401) {
            console.log('⚠️  Middleware d\'authentification arrête avant permission (401)');
        } else {
            console.log(`🤔 Status inattendu: ${createAuthorResponse.status}`);
            const body = await createAuthorResponse.text();
            console.log('Reponse:', body);
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testPermissionMiddleware();