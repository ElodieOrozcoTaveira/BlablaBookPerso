import sequelize from '../../src/config/database.js';
import '../../src/models/associations.js';
import { seedDatabase } from './seed.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    console.log('🚀 Starting complete database reset...');
    
    // Verifier la connexion
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // 1. Drop all tables
    console.log('🗑️ Dropping all tables...');
    await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    console.log('✅ All tables dropped successfully');
    
    // 2. Creer les tables
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

// Executer si appele directement (ES modules compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
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
