import { beforeAll, afterAll, jest } from '@jest/globals';
import sequelize from '../../src/config/database.js';
import { setupAssociations } from '../../src/models/associations.js';

// Avant tous les tests, on etablit la connexion a la BDD de test
// et on synchronise les modeles.
beforeAll(async () => {
  try {
    await sequelize.authenticate(); // Verifie la connexion
    setupAssociations(); // Configure les relations entre les modeles
    await sequelize.sync({ force: true }); // Cree les tables, les supprime si elles existent deja
  } catch (error) {
    console.error('FATAL: Failed to setup test database. Please ensure your .env file has the correct DB_TEST_* variables and the database is running.', error);
    throw error; // Re-throw the original error for a better stack trace
  }
}, 60000); // Timeout de 60s pour le setup

// Apres tous les tests, on ferme la connexion proprement
afterAll(async () => {
  await sequelize.close();
});

// Optionnel : garde le masquage des logs pour un output propre
global.console = {
    ...console,
    log: jest.fn(),
    // Decommentez la ligne suivante si vous voulez voir les erreurs dans la console
    // error: console.error,
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};
