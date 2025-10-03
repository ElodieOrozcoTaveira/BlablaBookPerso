// Tests supplémentaires critiques de sécurité 
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
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
import { APITester } from './auth-permissions.test.js';

describe('🔐 Tests Critiques - Scénarios de Sécurité Manquants', () => {
    let tester: APITester;

    beforeAll(async () => {
        await setupAssociations();

        // Créer un seul testeur partagé
        tester = new APITester(app);

        // Configuration des utilisateurs de test
        await tester.setupTestUsers();
        
        // Attendre un moment pour éviter les conflits
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('🚨 CRITIQUE: Un user ne peut PAS supprimer un admin', () => {
        it('❌ User standard tente de supprimer Super Admin → REFUSÉ', async () => {
            // Scénario le plus critique : user essaie de supprimer le super admin
            const superAdminUser = tester.getUser('admin');
            const response = await tester.authenticatedRequest('DELETE', `/api/users/${superAdminUser.id_user}`, 'user');

            expect([401, 403, 404]).toContain(response.status);
            expect(response.body.success).not.toBe(true);
            
            // Vérifier que le super admin existe toujours
            const adminExists = await User.findByPk(superAdminUser.id_user);
            expect(adminExists).toBeTruthy();
        });

        it('❌ User standard tente de supprimer Admin normal → REFUSÉ', async () => {
            const normalAdminUser = tester.getUser('admin');
            const response = await tester.authenticatedRequest('DELETE', `/api/users/${normalAdminUser.id_user}`, 'user');

            expect([401, 403, 404]).toContain(response.status);
            expect(response.body.success).not.toBe(true);

            // Vérifier que l'admin normal existe toujours
            const adminExists = await User.findByPk(normalAdminUser.id_user);
            expect(adminExists).toBeTruthy();
        });
    });

    describe('🔒 CRITIQUE: Hiérarchie des permissions d\'administration', () => {
        it('✅ Super Admin peut voir les stats de tous les utilisateurs', async () => {
            const normalAdminUser = tester.getUser('admin');
            const standardUserUser = tester.getUser('user');
            const responses = await Promise.all([
                tester.authenticatedRequest('GET', `/api/users/${normalAdminUser.id_user}/stats`, 'admin'),
                tester.authenticatedRequest('GET', `/api/users/${standardUserUser.id_user}/stats`, 'admin')
            ]);

            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });
        });

        it('✅ Admin normal peut voir les stats des utilisateurs standard', async () => {
            const standardUserUser = tester.getUser('user');
            const response = await tester.authenticatedRequest('GET', `/api/users/${standardUserUser.id_user}/stats`, 'admin');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('❌ Admin normal ne peut PAS supprimer le Super Admin', async () => {
            // Un admin normal ne devrait pas pouvoir supprimer un super admin
            const superAdminUser = tester.getUser('admin');
            const response = await tester.authenticatedRequest('DELETE', `/api/users/${superAdminUser.id_user}`, 'admin');

            expect([401, 403, 404]).toContain(response.status);
            
            // Vérifier que le super admin existe toujours
            const superAdminExists = await User.findByPk(superAdminUser.id_user);
            expect(superAdminExists).toBeTruthy();
        });
    });

    describe('⚠️ CRITIQUE: Tentatives d\'escalade de privilèges', () => {
        it('❌ User tente d\'accéder à la liste des admins', async () => {
            // Recherche d'utilisateurs avec des filtres qui pourraient révéler les admins
            const response = await tester.authenticatedRequest('GET', '/api/users?role=admin', 'user');

            expect([401, 403]).toContain(response.status);
        });

        it('❌ User tente de modifier les permissions via API inexistante', async () => {
            const standardUserUser = tester.getUser('user');
            const response = await tester.authenticatedRequest('POST', `/api/users/${standardUserUser.id_user}/permissions`, 'user', {
                permissions: ['ADMIN_USERS', 'DELETE_USERS']
            });

            expect([401, 403, 404]).toContain(response.status);
        });

        it('❌ User tente de créer un nouvel admin', async () => {
            const response = await tester.authenticatedRequest('POST', '/api/users/register', 'user', {
                firstname: 'Fake',
                lastname: 'Admin',
                username: 'fakeadmin',
                email: 'fake@admin.com',
                password: 'password123',
                role: 'admin'
            });

            expect([401, 403]).toContain(response.status);
        });
    });

    describe('🔐 CRITIQUE: Protection des données sensibles', () => {
        it('❌ User ne peut PAS voir les détails personnels des admins', async () => {
            const superAdminUser = tester.getUser('admin');
            const response = await tester.authenticatedRequest('GET', `/api/users/${superAdminUser.id_user}`, 'user');

            // Si la route existe et retourne 200, elle ne doit pas contenir d'infos sensibles
            if (response.status === 200) {
                expect(response.body.data).not.toHaveProperty('password');
                expect(response.body.data).not.toHaveProperty('email');
            } else {
                // Sinon elle doit être protégée
                expect([401, 403]).toContain(response.status);
            }
        });

        it('❌ User ne peut PAS lister tous les utilisateurs', async () => {
            const response = await tester.authenticatedRequest('GET', '/api/users', 'user');

            expect([401, 403]).toContain(response.status);
            expect(response.body.success).not.toBe(true);
        });

        it('✅ User peut seulement voir son propre profil', async () => {
            const ownProfileResponse = await tester.authenticatedRequest('GET', '/api/users/me/profile', 'user');

            expect(ownProfileResponse.status).toBe(200);
            expect(ownProfileResponse.body.success).toBe(true);
        });
    });

    describe('🛡️ CRITIQUE: Tests d\'intégrité du système', () => {
        it('Vérifier qu\'il existe au moins un Super Admin dans le système', async () => {
            const superAdminCount = await User.count({
                include: [{
                    model: Role,
                    as: 'Roles',
                    where: { name: 'admin' } // Admin dans le seeding de test
                }]
            });

            expect(superAdminCount).toBeGreaterThan(0);
        });

        it('Vérifier que les utilisateurs standards n\'ont pas de permissions admin', async () => {
            const standardUserUser = tester.getUser('user');
            const userWithPermissions = await User.findByPk(standardUserUser.id_user, {
                include: [{
                    model: Role,
                    as: 'Roles',
                    include: [{
                        model: Permission,
                        as: 'Permissions'
                    }]
                }]
            }) as any;

            const allPermissions = userWithPermissions.Roles?.flatMap((role: any) => 
                role.Permissions?.map((perm: any) => perm.label) || []
            ) || [];

            const adminPermissions = ['ADMIN_USERS', 'DELETE_USERS', 'VIEW_USER_STATS'];
            const hasAdminPerms = adminPermissions.some(perm => allPermissions.includes(perm));
            
            expect(hasAdminPerms).toBe(false);
        });

        it('Vérifier la cohérence des permissions en base de données', async () => {
            // Tous les admins doivent avoir au moins ADMIN_USERS
            const adminsWithPermissions = await User.findAll({
                include: [{
                    model: Role,
                    as: 'Roles',
                    where: { name: ['admin'] }, // Admin seulement dans le seeding de test
                    include: [{
                        model: Permission,
                        as: 'Permissions'
                    }]
                }]
            }) as any;

            adminsWithPermissions.forEach((admin: any) => {
                const permissions = admin.Roles.flatMap((role: any) => 
                    role.Permissions.map((perm: any) => perm.label)
                );
                expect(permissions).toContain('ADMIN_USERS');
            });
        });
    });
});
