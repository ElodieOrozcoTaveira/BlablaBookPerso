import { Sequelize } from 'sequelize';
import { setupAssociations } from './src/models/associations.ts';
// Je dois importer tous les modeles pour que Sequelize les voit
import Book from './src/models/Book.ts';
import Author from './src/models/Author.ts';
import Genre from './src/models/Genre.ts';
import User from './src/models/User.ts';
import Notice from './src/models/Notice.ts';

// Je force les parametres locaux
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';

console.log('🔄 SYNCHRONISATION DATABASE - Creation tables manquantes');
console.log('======================================================\n');

async function syncDatabase() {
  const sequelize = new Sequelize({
    database: 'blablabook',
    username: 'bobby', 
    password: 'othello',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: true // Je veux voir les requetes
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB reussie !');
    
    console.log('\n🔗 Setup des associations...');
    setupAssociations();
    
    console.log('\n📋 Synchronisation des modeles...');
    // Je force la synchronisation des modeles individuellement
    await Book.sync({ alter: true });
    await Author.sync({ alter: true });
    await Genre.sync({ alter: true });
    await User.sync({ alter: true });
    await Notice.sync({ alter: true });
    
    console.log('📋 Synchronisation des associations...');
    await sequelize.sync({ alter: true });
    
    console.log('\n✅ Synchronisation terminee !');
    
    // Je verifie les tables
    const [results] = await sequelize.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;");
    console.log('\n📊 Tables existantes:');
    results.forEach(row => console.log(`  - ${row.tablename}`));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();