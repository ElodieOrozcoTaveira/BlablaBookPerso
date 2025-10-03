import sequelize from '../../src/config/database.js';
import { setupAssociations } from '../../src/models/associations.js';
import { seedDatabase } from '../database/seed.js';
import { ensureExplicitTestUsers } from '../../tests/utils/test-users.ts';
import User from '../../src/models/User.js';

(async () => {
  try {
    setupAssociations();
    await sequelize.sync({ force: true });
    await seedDatabase();
    await ensureExplicitTestUsers();

    const adminUsernames = Array.from({ length: 10 }, (_, i) => `admin${i + 1}`);
    const normalUsernames = Array.from({ length: 10 }, (_, i) => `user${i + 1}`);

    const admins = await User.findAll({ where: { username: adminUsernames }, order: [['username', 'ASC']] });
    const users = await User.findAll({ where: { username: normalUsernames }, order: [['username', 'ASC']] });

    console.log('\n=== Admins (' + admins.length + ') ===');
    admins.forEach(u => console.log(u.get('username'), u.get('email')));
    console.log('\n=== Users (' + users.length + ') ===');
    users.forEach(u => console.log(u.get('username'), u.get('email')));

    await sequelize.close();
  } catch (err) {
    console.error('Erreur script show-explicit-test-users:', err);
    process.exit(1);
  }
})();
