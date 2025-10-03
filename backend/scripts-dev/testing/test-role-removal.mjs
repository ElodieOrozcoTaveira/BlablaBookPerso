#!/usr/bin/env node
import sequelize from '../../src/config/database.js';
import User from '../../src/models/User.js';
import Role from '../../src/models/Role.js';
import Permission from '../../src/models/Permission.js';
import '../../src/models/associations.js';

async function main() {
  const email = process.argv[2];
  if(!email) {
    console.error('Usage: node test-role-removal.mjs <userEmail>');
    process.exit(1);
  }
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email } });
  if(!user) { console.error('User not found'); process.exit(1); }
  const roles = await (user).getRoles();
  console.log('Initial roles:', roles.map(r=>r.name));
  const adminRole = await Role.findOne({ where: { name: 'admin' }});
  if(!adminRole) { console.error('Admin role not found'); process.exit(1); }
  // Remove admin
  await (user).removeRole(adminRole);
  const afterRemoval = await (user).getRoles();
  console.log('After removal roles:', afterRemoval.map(r=>r.name));
  // Try permissions
  const perms = [];
  for(const r of afterRemoval){
    const p = await (r).getPermissions();
    perms.push(...p.map(x=>x.label));
  }
  console.log('Permissions after removal:', [...new Set(perms)]);
  // Re-add
  await (user).addRole(adminRole);
  const restored = await (user).getRoles();
  console.log('Restored roles:', restored.map(r=>r.name));
  const perms2 = [];
  for(const r of restored){
    const p = await (r).getPermissions();
    perms2.push(...p.map(x=>x.label));
  }
  console.log('Permissions after restore:', [...new Set(perms2)]);
  await sequelize.close();
}
main().catch(e=>{console.error(e); process.exit(1);});
