import sequelize from '../config/database.js';
import '../models/associations';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  try {
    console.log('🏗️ Creating tables with Sequelize...');
    
    // Vérifier la connexion
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('📋 Synchronizing models with database...');
    
    // Créer toutes les tables avec Sequelize
    await sequelize.sync({ force: false, alter: false });
    
    console.log('✅ All tables created successfully via Sequelize!');
    
  } catch (error) {
    console.error('❌ Error creating database:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createDatabase()
    .then(() => {
      console.log('🎉 Table creation process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Table creation failed:', error);
      process.exit(1);
    });
}

export { createDatabase };