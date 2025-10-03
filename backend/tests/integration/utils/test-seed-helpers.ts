import sequelize from '../../../src/config/database.js';
import { seedDatabase } from '../../../scripts-dev/database/seed.js';
import { setupAssociations } from '../../../src/models/associations.js';

export async function resetAndSeed() {
  await sequelize.sync({ force: true });
  setupAssociations();
  await seedDatabase();
}
