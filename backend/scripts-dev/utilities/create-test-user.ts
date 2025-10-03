import argon2 from 'argon2';
import User from '../../src/models/User.js';
import sequelize from '../../src/config/database.js';

async function createTestUser(): Promise<void> {
    try {
        console.log('Création d\'un utilisateur de test...');
        
        const hashedPassword = await argon2.hash('password123');
        
        const user = await User.create({
            firstname: 'Test',
            lastname: 'User',
            username: 'testuser',
            email: 'test@test.com',
            password: hashedPassword
        });
        
        console.log(`Utilisateur créé avec succès : ${user.get('email')} (ID: ${user.get('id_user')})`);
        
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Executer si ce script est appelé directement
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
    createTestUser()
        .then(() => {
            console.log('Création terminée avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Echec de la création:', error);
            process.exit(1);
        });
}

export default createTestUser;