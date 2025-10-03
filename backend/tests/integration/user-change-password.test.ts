import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';

describe('🔐 Change Password Integration Tests', () => {
    let userCookie: string;
    let testUserId: number;

    beforeAll(async () => {
        // Créer et connecter un utilisateur de test
        const registerResponse = await request(app)
            .post('/api/users/register')
            .send({
                firstname: 'Test',
                lastname: 'ChangePassword',
                username: 'testchangepass',
                email: 'testchangepass@example.com',
                password: 'OldPassword123@'
            });

        expect(registerResponse.status).toBe(201);
        
        // Récupérer le cookie de session
        const cookies = registerResponse.headers['set-cookie'];
        expect(cookies).toBeDefined();
        userCookie = cookies[0];
        testUserId = registerResponse.body.data.user.id_user;
    });

    describe('POST /api/users/me/change-password', () => {
        it('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .post('/api/users/me/change-password')
                .send({
                    current_password: 'OldPassword123@',
                    new_password: 'NewPassword123@',
                    confirm_password: 'NewPassword123@'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Token d\'authentification requis');
        });

        it('should return 400 when validation fails - missing fields', async () => {
            const response = await request(app)
                .post('/api/users/me/change-password')
                .set('Cookie', userCookie)
                .send({
                    current_password: 'OldPassword123@'
                    // Champs manquants
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 when passwords do not match', async () => {
            const response = await request(app)
                .post('/api/users/me/change-password')
                .set('Cookie', userCookie)
                .send({
                    current_password: 'OldPassword123@',
                    new_password: 'NewPassword123@',
                    confirm_password: 'DifferentPassword123@'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should return 400 when new password is too weak', async () => {
            const response = await request(app)
                .post('/api/users/me/change-password')
                .set('Cookie', userCookie)
                .send({
                    current_password: 'OldPassword123@',
                    new_password: 'weak',
                    confirm_password: 'weak'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should return 400 when current password is incorrect', async () => {
            const response = await request(app)
                .post('/api/users/me/change-password')
                .set('Cookie', userCookie)
                .send({
                    current_password: 'WrongPassword123@',
                    new_password: 'NewPassword123@',
                    confirm_password: 'NewPassword123@'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Mot de passe actuel incorrect');
        });

        it('should successfully change password with valid data', async () => {
            const response = await request(app)
                .post('/api/users/me/change-password')
                .set('Cookie', userCookie)
                .send({
                    current_password: 'OldPassword123@',
                    new_password: 'NewPassword456@',
                    confirm_password: 'NewPassword456@'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Mot de passe mis a jour avec succes');
            expect(response.body.data).toBeUndefined(); // Ne devrait pas retourner de données sensibles
        });

        it('should be able to login with new password after change', async () => {
            // Essayer de se connecter avec l'ancien mot de passe (devrait échouer)
            const oldPasswordResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testchangepass@example.com',
                    password: 'OldPassword123@'
                });

            expect(oldPasswordResponse.status).toBe(401);

            // Essayer de se connecter avec le nouveau mot de passe (devrait réussir)
            const newPasswordResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testchangepass@example.com',
                    password: 'NewPassword456@'
                });

            expect(newPasswordResponse.status).toBe(200);
            expect(newPasswordResponse.body.success).toBe(true);
        });

        it('should fail to change password with old password after change', async () => {
            // Utiliser le nouveau cookie de session
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testchangepass@example.com',
                    password: 'NewPassword456@'
                });

            const newUserCookie = loginResponse.headers['set-cookie'][0];

            const response = await request(app)
                .post('/api/users/me/change-password')
                .set('Cookie', newUserCookie)
                .send({
                    current_password: 'OldPassword123@', // Ancien mot de passe
                    new_password: 'AnotherPassword789@',
                    confirm_password: 'AnotherPassword789@'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Mot de passe actuel incorrect');
        });
    });
});