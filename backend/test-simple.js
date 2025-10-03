import argon2 from 'argon2';
import { Sequelize } from 'sequelize';
import User from './src/models/User.ts';

// Je force les variables d'environnement
process.env.NODE_ENV = 'development';

console.log('🧪 TEST SIMPLE - Creation utilisateur + Tests workflow');
console.log('===============================================\n');

async function createTestUser() {
  // Je force les parametres locaux (pas Docker)
  const sequelize = new Sequelize({
    database: 'blablabook',
    username: 'bobby', 
    password: 'othello',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB reussie !');

    // Je cree un utilisateur test avec argon2
    const testPassword = await argon2.hash('test123');
    
    const testUser = await User.findOrCreate({
      where: { email: 'test@blablabook.com' },
      defaults: {
        username: 'testeur',
        email: 'test@blablabook.com',
        password: testPassword,
        firstname: 'Test',
        lastname: 'User'
      }
    });

    if (testUser[1]) {
      console.log('✅ Utilisateur test cree:', testUser[0].username);
    } else {
      console.log('✅ Utilisateur test existe deja:', testUser[0].username);
    }
    
    console.log('📧 Email:', testUser[0].email);
    console.log('🆔 ID:', testUser[0].id_user);
    
    console.log('\n🎯 Utilisateur pret pour les tests workflow !');
    console.log('Prochaines etapes:');
    console.log('1. Login avec test@blablabook.com / test123');
    console.log('2. Rechercher un livre (ex: Harry Potter)');
    console.log('3. Noter le livre → import temporaire');
    console.log('4. Valider → confirmer import');
    console.log('5. Tester annulation sur nouveau livre');

    return testUser[0];

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestUser();