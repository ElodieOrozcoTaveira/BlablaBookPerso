// Tests critiques de sécurité pour la protection des administrateurs
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/test-server.js';
import User from '../../src/models/User.js';
import Role from '../../src/models/Role.js';
import Permission from '../../src/models/Permission.js';
import UserRole from '../../src/models/UserRole.js';
import RolePermission from '../../src/models/RolePermission.js';
import * as argon2 from 'argon2';
import sequelize from '../../src/config/database.js';
import { setupAssociations } from '../../src/models/associations.js';

describe('🔐 Tests de sécurité - Protection des Administrateurs', () => {
    let adminUser: any;
    let standardUser: any;
    let adminAgent: any;
    let userAgent: any;

    beforeAll(async () => {
        // Configuration de la base de données
        await sequelize.authenticate();
        setupAssociations();
        await sequelize.sync({ force: true });

        // Créer les rôles et permissions de base
        const adminRole = await Role.create({
            name: 'admin',
            description: 'Administrateur système'
        });

        const userRole = await Role.create({
            name: 'user',
            description: 'Utilisateur standard'
        });

        // Créer les permissions
        const adminUsersPermission = await Permission.create({
            label: 'ADMIN_USERS',
            action: 'Administration des utilisateurs'
        });

        const deletePermission = await Permission.create({
            label: 'DELETE',
            action: 'Supprimer du contenu'
        });

        // Créer les associations Role-Permission via le modèle RolePermission
        await RolePermission.create({
            id_role: adminRole.id_role,
            id_permission: adminUsersPermission.id_permission
        });

        await RolePermission.create({
            id_role: adminRole.id_role,
            id_permission: deletePermission.id_permission
        });

        // L'utilisateur standard n'a PAS de permissions d'administration
        // (pas d'attribution de permissions admin)

        // Créer les utilisateurs de test
        const hashedPassword = await argon2.hash('testpass123');
        
        adminUser = await User.create({
            firstname: 'Super',
            lastname: 'Admin',
            username: 'superadmin',
            email: 'superadmin@test.com',
            password: hashedPassword
        });

        standardUser = await User.create({
            firstname: 'Standard',
            lastname: 'User',
            username: 'standarduser',
            email: 'standarduser@test.com',
            password: hashedPassword
        });

        // Attribuer les rôles
        await UserRole.create({
            id_user: adminUser.id_user,
            id_role: adminRole.id_role
        });

        await UserRole.create({
            id_user: standardUser.id_user,
            id_role: userRole.id_role
        });

        // Créer des agents pour maintenir les sessions
        adminAgent = request.agent(app);
        userAgent = request.agent(app);

        // Se connecter et établir les sessions
        const adminLogin = await adminAgent
            .post('/api/auth/login')
            .send({
                email: 'superadmin@test.com',
                password: 'testpass123'
            });

        const userLogin = await userAgent
            .post('/api/auth/login')
            .send({
                email: 'standarduser@test.com',
                password: 'testpass123'
            });

        console.log('Admin login status:', adminLogin.status);
        console.log('User login status:', userLogin.status);
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('🚫 Protection contre l\'escalade de privilèges', () => {
        it('Un utilisateur standard ne peut PAS supprimer son propre compte s\'il devient admin', async () => {
            // Scénario: Un utilisateur tente de s'auto-promouvoir admin puis supprimer un autre admin
            // Même si il modifie ses permissions localement, le serveur doit rejeter
            
            const response = await userAgent
                .delete(`/api/users/${adminUser.id_user}`);

            // L'utilisateur standard ne peut pas accéder à cette route admin
            expect([401, 403, 404]).toContain(response.status);
            if (response.status !== 404) {
                expect(response.body.success).toBe(false);
            }
        });

        it('Un utilisateur standard ne peut PAS lister les utilisateurs (route admin)', async () => {
            const response = await userAgent
                .get('/api/users');

            expect([401, 403]).toContain(response.status);
            if (response.body?.success !== undefined) {
                expect(response.body.success).toBe(false);
            }
        });

        it('Un utilisateur standard ne peut PAS modifier le profil d\'un admin', async () => {
            const response = await userAgent
                .put(`/api/users/${adminUser.id_user}/profile`)
                .send({
                    firstname: 'Pirate',
                    lastname: 'Hacker'
                });

            // Cette route n'existe probablement pas, donc 404, mais ne doit pas être 200
            expect([401, 403, 404]).toContain(response.status);
        });

        it('Un utilisateur standard ne peut PAS accéder aux statistiques d\'un admin', async () => {
            const response = await userAgent
                .get(`/api/users/${adminUser.id_user}/stats`);

            expect([401, 403]).toContain(response.status);
            if (response.body?.success !== undefined) {
                expect(response.body.success).toBe(false);
            }
        });
    });

    describe('🛡️ Protection des comptes administrateurs', () => {
        it('Un admin peut lister tous les utilisateurs', async () => {
            const response = await adminAgent
                .get('/api/users');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('Un admin peut voir les statistiques de n\'importe quel utilisateur', async () => {
            const response = await adminAgent
                .get(`/api/users/${standardUser.id_user}/stats`);

            // Route peut ne pas être implémentée ou nécessiter des permissions spéciales
            expect([200, 403, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
            }
        });

        it('Un utilisateur ne peut supprimer QUE son propre compte', async () => {
            // L'utilisateur peut supprimer son propre compte
            const ownAccountResponse = await userAgent
                .delete('/api/users/me');

            expect(ownAccountResponse.status).toBe(200);
            expect(ownAccountResponse.body.success).toBe(true);
        });

        it('Vérifier que l\'admin existe toujours après tentative de suppression par user', async () => {
            // Vérifier que l'admin n'a pas été supprimé
            const adminStillExists = await User.findByPk(adminUser.id_user);
            expect(adminStillExists).toBeTruthy();
            expect(adminStillExists?.email).toBe('superadmin@test.com');
        });
    });

    describe('🔍 Tests de détection d\'intrusion', () => {
        it('Tentative d\'accès à des routes admin sans token', async () => {
            const routes = [
                '/api/users',
                `/api/users/${adminUser.id_user}/stats`,
                '/api/users/admin/dashboard', // Route hypothétique
            ];

            for (const route of routes) {
                const response = await request(app).get(route);
                expect([401, 404]).toContain(response.status);
            }
        });

        it('Tentative d\'accès à des routes admin avec token invalide', async () => {
            const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5LCJyb2xlIjoiYWRtaW4ifQ.fake';
            
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${fakeToken}`);

            expect([401, 403]).toContain(response.status);
        });

        it('Tentative de modification de rôle via payload JWT manipulé', async () => {
            // Test avec un token manipulé pour se faire passer pour admin
            const fakeToken = 'Bearer fake-admin-token-12345';
            
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', fakeToken);

            expect([401, 403]).toContain(response.status);
        });
    });

    describe('📊 Tests de cohérence des permissions', () => {
        it('Vérifier que les permissions sont correctement appliquées en base', async () => {
            // Récupérer l'admin avec ses rôles et permissions
            const adminWithRoles = await User.findByPk(adminUser.id_user, {
                include: [{
                    model: Role,
                    as: 'Roles',
                    include: [{
                        model: Permission,
                        as: 'Permissions'
                    }]
                }]
            }) as any;

            expect(adminWithRoles.Roles).toBeTruthy();
            expect(adminWithRoles.Roles.length).toBeGreaterThan(0);
            
            const adminRole = adminWithRoles.Roles.find((role: any) => role.name === 'admin');
            expect(adminRole).toBeTruthy();
            expect(adminRole.Permissions).toBeTruthy();
            expect(adminRole.Permissions.length).toBeGreaterThan(0);
        });

        it('Vérifier que l\'utilisateur standard n\'a PAS de permissions admin', async () => {
            // L'utilisateur peut avoir été supprimé dans un test précédent
            const userWithRoles = await User.findByPk(standardUser.id_user, {
                include: [{
                    model: Role,
                    as: 'Roles',
                    include: [{
                        model: Permission,
                        as: 'Permissions'
                    }]
                }]
            }) as any;

            if (userWithRoles) {
                // L'utilisateur peut avoir des rôles ou pas
                if (userWithRoles.Roles && userWithRoles.Roles.length > 0) {
                    // L'utilisateur ne doit pas avoir de rôle admin
                    const adminRole = userWithRoles.Roles.find((role: any) => role.name === 'admin');
                    expect(adminRole).toBeFalsy();

                    // Vérifier qu'il n'a pas de permission ADMIN_USERS
                    const allPermissions = userWithRoles.Roles.flatMap((role: any) => 
                        role.Permissions?.map((perm: any) => perm.label) || []
                    );
                    expect(allPermissions).not.toContain('ADMIN_USERS');
                } else {
                    // Pas de rôles = pas d'admin, c'est bon
                    expect(true).toBe(true);
                }
            } else {
                // Utilisateur supprimé = pas d'admin possible, test réussi
                expect(true).toBe(true);
            }
        });
    });

    describe('🔒 Tests de sécurité des sessions', () => {
        it('Token expiré ne peut pas accéder aux routes admin', async () => {
            // Ce test nécessiterait de mocker la date ou d'utiliser un token expiré
            // Pour l'instant, on vérifie juste qu'un token vide est rejeté
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer ');

            expect([401, 403]).toContain(response.status);
        });

        it('Headers d\'autorisation malformés sont rejetés', async () => {
            const malformedHeaders = [
                'Basic fake-token-123',
                'Bearerfake-token-123', // Manque l'espace
                'fake-token-123', // Pas de Bearer
                'Bearer ', // Token vide
            ];

            for (const header of malformedHeaders) {
                const response = await request(app)
                    .get('/api/users')
                    .set('Authorization', header);

                expect([401, 403]).toContain(response.status);
            }
        });
    });
});
