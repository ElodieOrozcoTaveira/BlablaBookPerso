// Suite de tests automatisés pour les permissions et l'authentification
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/test-server.js';
import User from '../../src/models/User.js';
import Role from '../../src/models/Role.js';
import Permission from '../../src/models/Permission.js';
import * as argon2 from 'argon2';
import sequelize from '../../src/config/database.js';
import { Op } from 'sequelize';

/**
 * Classe utilitaire pour les tests d'API
 */
class APITester {
    private app: any;
    private tokens: { [key: string]: string } = {};
    private users: { [key: string]: any } = {};
    private sessionCookies: { [key: string]: string } = {};

    constructor(expressApp: any) {
        this.app = expressApp;
    }

    /**
     * Créer des utilisateurs de test avec différents rôles
     */
    async setupTestUsers() {
        // Nettoyer les utilisateurs de test existants
        await this.cleanupTestUsers();

        const timestamp = Date.now();
        const hashedPassword = await argon2.hash('test123');

        // Utilisateur admin
        const adminUser = await User.create({
            firstname: 'Test',
            lastname: 'Admin', 
            username: `testadmin_${timestamp}`,
            email: `admin_${timestamp}@test.com`,
            password: hashedPassword
        });

        // Utilisateur standard
        const standardUser = await User.create({
            firstname: 'Test',
            lastname: 'User',
            username: `testuser_${timestamp}`,
            email: `user_${timestamp}@test.com`, 
            password: hashedPassword
        });

        // Utilisateur sans permissions
        const noPermUser = await User.create({
            firstname: 'No',
            lastname: 'Permission',
            username: `noperm_${timestamp}`,
            email: `noperm_${timestamp}@test.com`,
            password: hashedPassword
        });

        // Assigner les rôles appropriés
        await this.assignRoles(adminUser, 'admin');
        await this.assignRoles(standardUser, 'user');
        // noPermUser n'a pas de rôle assigné

        this.users = {
            admin: adminUser,
            user: standardUser,
            noperm: noPermUser
        };

        return this.users;
    }

    /**
     * Assigner un rôle à un utilisateur
     */
    private async assignRoles(user: any, roleName: string) {
        try {
            const role = await Role.findOne({ where: { name: roleName } });
            if (role && user) {
                // Import UserRole model
                const { UserRole } = await import('../../src/models/associations.js');
                await UserRole.create({
                    id_user: user.id_user,
                    id_role: role.id_role
                });
            }
        } catch (error) {
            console.warn(`Failed to assign role ${roleName} to user ${user.id_user}:`, error);
        }
    }

    /**
     * Nettoyer les utilisateurs de test existants
     */
    private async cleanupTestUsers() {
        try {
            await User.destroy({ 
                where: { 
                    email: {
                        [Op.like]: '%@test.com'
                    }
                } 
            });
        } catch (error) {
            // Ignore cleanup errors
        }
    }

    /**
     * Se connecter et récupérer les tokens
     */
    async login(userType: 'admin' | 'user' | 'noperm') {
        const user = this.users[userType];
        if (!user) {
            throw new Error(`User not found: ${userType}. Call setupTestUsers() first.`);
        }

        const credentials = {
            email: user.email,
            password: 'test123'
        };

        const response = await request(this.app)
            .post('/api/auth/login')
            .send(credentials);

        if (response.status === 200) {
            // Try JWT token first
            if (response.body.token) {
                this.tokens[userType] = response.body.token;
                return response.body.token;
            }
            
            // Capture session cookie from response
            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
                const cookiesArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader].filter(Boolean);
                
                // Find session cookie
                for (const cookie of cookiesArray) {
                    if (cookie.includes('blablabook.sid=') || cookie.includes('connect.sid=')) {
                        this.sessionCookies[userType] = cookie.split(';')[0]; // Keep only the cookie value
                        this.tokens[userType] = 'session';
                        return 'session';
                    }
                }
            }
            
            // Login successful but no token/cookie found - this shouldn't happen
            throw new Error(`Login successful for ${userType} but no authentication token found`);
        }

        throw new Error(`Login failed for ${userType}: ${response.body?.message || response.status}`);
    }

    /**
     * Extract session token from cookies
     */
    private extractTokenFromCookie(cookies: string[] | undefined): string | undefined {
        if (!cookies) return undefined;
        
        for (const cookie of cookies) {
            const match = cookie.match(/session=([^;]+)/);
            if (match) return match[1];
        }
        return undefined;
    }

    /**
     * Faire une requête authentifiée
     */
    async authenticatedRequest(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', 
                              endpoint: string, 
                              userType: 'admin' | 'user' | 'noperm', 
                              data?: any) {
        // S'assurer que l'utilisateur est connecté
        await this.ensureLoggedIn(userType);
        
        const token = this.tokens[userType];
        if (!token) {
            throw new Error(`No token found for user type: ${userType}`);
        }

        const req = request(this.app)[method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'](endpoint);

        // Handle different authentication methods
        if (token === 'session') {
            // Use captured session cookie
            const sessionCookie = this.sessionCookies[userType];
            if (sessionCookie) {
                req.set('Cookie', sessionCookie);
            }
        } else if (token.startsWith('Bearer ') || !token.includes('=')) {
            // JWT token
            req.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
        } else {
            // Session cookie
            req.set('Cookie', `session=${token}`);
        }

        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
            req.send(data);
        }

        return req;
    }

    /**
     * Récupérer un utilisateur de test par type
     */
    getUser(userType: 'admin' | 'user' | 'noperm') {
        const user = this.users[userType];
        if (!user) {
            throw new Error(`User not found: ${userType}. Call setupTestUsers() first.`);
        }
        return user;
    }

    /**
     * Se connecter automatiquement si pas encore connecté
     */
    async ensureLoggedIn(userType: 'admin' | 'user' | 'noperm') {
        if (!this.tokens[userType]) {
            await this.login(userType);
        }
        return this.tokens[userType];
    }

    /**
     * Tester les permissions sur une route
     */
    async testPermissions(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', data?: any) {
        const results = {
            admin: null as any,
            user: null as any,
            noperm: null as any,
            anonymous: null as any
        };

        // Test anonyme
        const anonReq = request(this.app)[method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'](endpoint);
        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
            anonReq.send(data);
        }
        results.anonymous = await anonReq;

        // Tests authentifiés
        for (const userType of ['admin', 'user', 'noperm'] as const) {
            try {
                results[userType] = await this.authenticatedRequest(method, endpoint, userType, data);
            } catch (error) {
                results[userType] = { status: 500, error: (error as Error).message };
            }
        }

        return results;
    }

    /**
     * Générer un rapport de test
     */
    generateReport(endpoint: string, method: string, results: any) {
        console.log(`\n🔍 Testing ${method} ${endpoint}`);
        console.log('─────────────────────────────────');
        
        Object.entries(results).forEach(([userType, result]: [string, any]) => {
            const status = result?.status || 'ERROR';
            const icon = this.getStatusIcon(status);
            const message = result?.body?.message || result?.error || 'Unknown';
            
            console.log(`${icon} ${userType.padEnd(10)}: ${status} - ${message}`);
        });
    }

    private getStatusIcon(status: number): string {
        if (status >= 200 && status < 300) return '✅';
        if (status === 401) return '🔒';
        if (status === 403) return '🚫';
        if (status === 404) return '❓';
        return '❌';
    }

    /**
     * Nettoyer les données de test
     */
    async cleanup() {
        // Supprimer les utilisateurs de test
        for (const user of Object.values(this.users)) {
            if (user?.id_user) {
                await User.destroy({ where: { id_user: user.id_user } });
            }
        }
        
        this.tokens = {};
        this.users = {};
    }
}

/**
 * Tests des routes protégées
 */
describe('🔐 Tests d\'authentification et permissions', () => {
    let tester: APITester;

    beforeAll(async () => {
        // Synchroniser la DB et créer les utilisateurs
        await sequelize.sync({ force: false });
        tester = new APITester(app);
        await tester.setupTestUsers();
        
        // Se connecter avec tous les utilisateurs
        await tester.login('admin');
        await tester.login('user'); 
        await tester.login('noperm');
    });

    afterAll(async () => {
        await tester.cleanup();
    });

    describe('📚 Tests des routes Authors', () => {
        it('GET /api/authors - Route publique', async () => {
            const results = await tester.testPermissions('/api/authors', 'GET');
            tester.generateReport('/api/authors', 'GET', results);
            
            // Toutes les réponses doivent être 200
            expect(results.anonymous.status).toBe(200);
            expect(results.admin.status).toBe(200);
            expect(results.user.status).toBe(200);
            expect(results.noperm.status).toBe(200);
        });

        it('POST /api/authors - Permission CREATE_AUTHOR requise', async () => {
            const newAuthor = {
                name: 'Test Author',
                bio: 'Auteur de test'
            };

            const results = await tester.testPermissions('/api/authors', 'POST', newAuthor);
            tester.generateReport('/api/authors', 'POST', results);
            
            expect(results.anonymous.status).toBe(401); // Non authentifié
            expect(results.admin.status).toBe(201);     // Admin = OK
            expect([403, 401]).toContain(results.user.status);   // User = refusé
            expect([403, 401]).toContain(results.noperm.status); // No perm = refusé
        });

        it('PUT /api/authors/1 - Permission UPDATE_AUTHOR requise', async () => {
            const updateAuthor = {
                name: 'Updated Author',
                bio: 'Bio mise à jour'
            };

            const results = await tester.testPermissions('/api/authors/1', 'PUT', updateAuthor);
            tester.generateReport('/api/authors/1', 'PUT', results);
            
            expect(results.anonymous.status).toBe(401);
            expect(results.admin.status).toBe(200);
            expect([403, 401]).toContain(results.user.status);
            expect([403, 401]).toContain(results.noperm.status);
        });

        it('DELETE /api/authors/1 - Permission DELETE_AUTHOR requise', async () => {
            const results = await tester.testPermissions('/api/authors/1', 'DELETE');
            tester.generateReport('/api/authors/1', 'DELETE', results);
            
            expect(results.anonymous.status).toBe(401);
            expect([200, 204, 404]).toContain(results.admin.status); // OK, No Content ou not found
            expect([403, 401]).toContain(results.user.status);
            expect([403, 401]).toContain(results.noperm.status);
        });
    });

    describe('🎭 Tests des routes Genres', () => {
        it('POST /api/genres - Routes genre sans permission spécifique', async () => {
            const newGenre = {
                name: 'Test Genre'
            };

            const results = await tester.testPermissions('/api/genres', 'POST', newGenre);
            tester.generateReport('/api/genres', 'POST', results);
            
            // Les genres n'ont pas de permissions dans votre config actuelle
            expect(results.anonymous.status).toBe(401);
            // Les utilisateurs authentifiés peuvent créer des genres
        });
    });

    describe('📖 Tests des routes Libraries', () => {
        it('POST /api/libraries - Authentification requise', async () => {
            const newLibrary = {
                name: 'Ma Bibliothèque Test',
                description: 'Test de bibliothèque',
                is_public: false
            };

            const results = await tester.testPermissions('/api/libraries', 'POST', newLibrary);
            tester.generateReport('/api/libraries', 'POST', results);
            
            expect(results.anonymous.status).toBe(401);
            // Tous les utilisateurs authentifiés peuvent créer des bibliothèques
            expect(results.admin.status).toBe(201);
            expect(results.user.status).toBe(201);
            expect(results.noperm.status).toBe(201);
        });

        it('GET /api/libraries/me/all - Mes bibliothèques', async () => {
            const results = await tester.testPermissions('/api/libraries/me/all', 'GET');
            tester.generateReport('/api/libraries/me/all', 'GET', results);
            
            expect(results.anonymous.status).toBe(401);
            expect(results.admin.status).toBe(200);
            expect(results.user.status).toBe(200);
            expect(results.noperm.status).toBe(200);
        });
    });

    describe('👥 Tests des routes Users', () => {
        it('GET /api/users - Permission ADMIN_USERS requise', async () => {
            const results = await tester.testPermissions('/api/users', 'GET');
            tester.generateReport('/api/users', 'GET', results);
            
            expect(results.anonymous.status).toBe(401);
            expect(results.admin.status).toBe(200);  // Admin OK
            expect([403, 401]).toContain(results.user.status);   // User refusé
            expect([403, 401]).toContain(results.noperm.status); // No perm refusé
        });

        it('GET /api/users/1/stats - Permission VIEW_USER_STATS requise', async () => {
            const results = await tester.testPermissions('/api/users/1/stats', 'GET');
            tester.generateReport('/api/users/1/stats', 'GET', results);
            
            expect(results.anonymous.status).toBe(401);
            expect(results.admin.status).toBe(200);
            expect([403, 401]).toContain(results.user.status);
            expect([403, 401]).toContain(results.noperm.status);
        });
    });

    describe('📥📤 Tests des routes Import/Export', () => {
        it('POST /api/openlibrary/import/book - Import livre', async () => {
            const importData = {
                open_library_key: '/works/OL45804W' // Fantastic Mr Fox
            };

            const results = await tester.testPermissions('/api/openlibrary/import/book', 'POST', importData);
            tester.generateReport('/api/openlibrary/import/book', 'POST', results);
            
            expect(results.anonymous.status).toBe(401);
            // Actuellement, tous les utilisateurs authentifiés peuvent importer
            // Dans une version future, il faudrait la permission IMPORT
        });

        it('POST /api/openlibrary/import/author - Import auteur', async () => {
            const importData = {
                author_key: '/authors/OL26320A' // J.R.R. Tolkien
            };

            const results = await tester.testPermissions('/api/openlibrary/import/author', 'POST', importData);
            tester.generateReport('/api/openlibrary/import/author', 'POST', results);
            
            expect(results.anonymous.status).toBe(401);
        });
    });

    describe('🔍 Tests de sécurité globaux', () => {
        it('Vérifier les headers de sécurité', async () => {
            const response = await request(app).get('/api/health');
            
            // Vérifier les headers de sécurité (helmet)
            expect(response.headers).toHaveProperty('x-content-type-options');
            expect(response.headers).toHaveProperty('x-frame-options');
        });

        it('Rate limiting sur auth', async () => {
            // Tenter plusieurs connexions échouées rapidement
            const promises = Array(6).fill(null).map(() =>
                request(app)
                    .post('/api/auth/login')
                    .send({ email: 'wrong@test.com', password: 'wrongpass' })
            );

            const responses = await Promise.all(promises);
            const rateLimited = responses.some(r => r.status === 429);
            
            // Au moins une requête doit être rate limitée
            expect(rateLimited).toBe(true);
        });
    });
});

export { APITester };
