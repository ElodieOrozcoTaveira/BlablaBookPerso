import sequelize from '../config/database.js';
import '../models/associations';
import { seedDatabase } from './db-seed.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    console.log('🚀 Starting complete database reset...');
    
    // Vérifier la connexion
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // 1. Drop all tables
    console.log('🗑️ Dropping all tables...');
    await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    console.log('✅ All tables dropped successfully');
    
    // 2. Créer les tables
    console.log('🏗️ Creating tables...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ All tables created successfully');
    
    // 3. Seed data
    console.log('🌱 Seeding database...');
    await seedDatabase();
    
    console.log('✅ Complete database reset successful!');
    console.log('🎉 Database is ready to use!');
    
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('🎉 Reset process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Reset failed:', error);
      process.exit(1);
    });
}

export { resetDatabase };
