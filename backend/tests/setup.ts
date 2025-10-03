import dotenv from 'dotenv';
// Chargement de .env.test si present
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: __dirname + '/../.env.test' });
} else {
    dotenv.config();
}

// Importer sequelize et helpers
import sequelize from '../src/config/database.js';
import { setupAssociations } from '../src/models/associations.js';
import { seedDatabase } from '../scripts-dev/database/seed.js';
import { ensureExplicitTestUsers } from './utils/test-users.js';

// Setup global avant les tests: sync + seed minimal
async function globalSetup() {
    console.log('[tests/setup] Initialisation de la DB pour les tests...');

    // Modes de contournement pour tests unitaires mockés (pas de DB réelle)
    if (process.env.SKIP_DB_SETUP === '1' || process.env.UNIT_NO_DB === '1') {
        console.log('[tests/setup] DB init skipped (SKIP_DB_SETUP=1 ou UNIT_NO_DB=1)');
        return;
    }

    // Configurer les associations (idempotent)
    setupAssociations();

    // Synchroniser le schema (force pour avoir une base propre)
    try {
        await sequelize.sync({ force: true });
        console.log('[tests/setup] Schema synchronise (force: true)');

        // Seed complet existant: execute le seeder du projet pour avoir users/roles/permissions
    await seedDatabase();
    console.log('[tests/setup] Seed effectue');
    await ensureExplicitTestUsers();
    // Vérification du nombre d'utilisateurs présents après le seed
    const User = (await import('../src/models/User.js')).default;
    const userCount = await User.count();
    const user1 = await User.findOne({ where: { email: 'user1@test.com' } });
    console.log(`[tests/setup] Utilisateurs en base: ${userCount}, user1@test.com présent: ${!!user1}`);
    console.log('[tests/setup] Utilisateurs de test explicites ajoutes (admin1 / user1)');
    } catch (err) {
        console.error('[tests/setup] Erreur initialisation DB:', err);
        throw err;
    }
}

// Global guard to ensure setup runs only once per test session
let globalSetupCompleted = false;

// Execute the setup immediately when this module is loaded (for Vitest setupFiles)
if (!globalSetupCompleted) {
    await globalSetup();
    globalSetupCompleted = true;
}
