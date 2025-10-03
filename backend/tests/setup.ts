import { beforeAll, afterAll, jest } from '@jest/globals';
import { config } from 'dotenv';
import sequelize from '../src/config/database.js';
import { setupAssociations } from '../src/models/associations.js';

// Charger la configuration de test
config({ path: '.env.test' });

// Avant tous les tests, on établit la connexion à la BDD de test
// et on synchronise les modèles.
beforeAll(async () => {
  try {
    await sequelize.authenticate(); // Vérifie la connexion
    setupAssociations(); // Configure les relations entre les modèles
    await sequelize.sync({ force: true }); // Crée les tables, les supprime si elles existent déjà
  } catch (error) {
    console.error('FATAL: Failed to setup test database. Please ensure your .env file has the correct DB_TEST_* variables and the database is running.', error);
    throw error; // Re-throw the original error for a better stack trace
  }
});

// Après tous les tests, on ferme la connexion proprement
afterAll(async () => {
  await sequelize.close();
});

// Optionnel : garde le masquage des logs pour un output propre
global.console = {
    ...console,
    log: jest.fn(),
    // Décommentez la ligne suivante si vous voulez voir les erreurs dans la console
    // error: console.error,
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};
