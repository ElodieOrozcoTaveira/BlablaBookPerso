import * as argon2 from 'argon2';
import User from '../../src/models/User.js';
import Role from '../../src/models/Role.js';
import UserRole from '../../src/models/UserRole.js';

/**
 * Crée (idempotent) les utilisateurs de tests explicites admin1 / user1
 * en dehors du seeder métier (qui reste neutre).
 */
let __explicitUsersSeeded = false;

/**
 * Crée l'ensemble des utilisateurs de tests (idempotent) une seule fois par process.
 * Optimisations:
 *  - Hash Argon2 calculé une seule fois par type (admin/user) au lieu de 20 fois.
 *  - Garde interne évitant de relancer toutes les requêtes si déjà seedé.
 */
export async function ensureExplicitTestUsers(options: { force?: boolean } = {}) {
  if (__explicitUsersSeeded && !options.force) return;

  const COUNT = 10;
  const adminPassword = 'Adminpass123!';
  const userPassword = 'Userpass123!';

  // Pré-calcul de deux hashes seulement (réduction CPU)
  const [adminHash, userHash] = await Promise.all([
    argon2.hash(adminPassword),
    argon2.hash(userPassword)
  ]);

  const now = new Date();

  for (let i = 1; i <= COUNT; i++) {
    await upsertUserWithRole({
      firstname: 'Harry', lastname: 'Cover', username: `admin${i}`,
      email: `admin${i}@test.com`, password: adminHash, role: 'admin', now
    });
  }
  for (let i = 1; i <= COUNT; i++) {
    await upsertUserWithRole({
      firstname: 'Lorraine', lastname: 'Quiche', username: `user${i}`,
      email: `user${i}@test.com`, password: userHash, role: 'user', now
    });
  }

  __explicitUsersSeeded = true;
}

async function upsertUserWithRole(args: { firstname: string; lastname: string; username: string; email: string; password: string; role: string; now: Date }) {
  const { firstname, lastname, username, email, password, role, now } = args;
  const [user] = await User.findOrCreate({
    where: { username },
    defaults: { firstname, lastname, username, email, password, connected_at: now, created_at: now }
  });
  const roleRow = await Role.findOne({ where: { name: role } });
  if (roleRow) {
    await UserRole.findOrCreate({
      where: { id_user: user.get('id_user'), id_role: roleRow.get('id_role') },
      defaults: { id_user: user.get('id_user') as number, id_role: roleRow.get('id_role') as number }
    });
  }
}
