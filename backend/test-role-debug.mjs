import sequelize from './src/config/database.js';
import { setupAssociations } from './src/models/associations.js';
import Role from './src/models/Role.js';

setupAssociations();

async function testRole() {
    try {
        console.log('🔍 Testing Role model...');
        
        const role = await Role.findOne({ where: { name: 'user' } });
        console.log('Role found:', role);
        console.log('Role dataValues:', role?.dataValues);
        console.log('Role id_role:', role?.id_role);
        
        const allRoles = await Role.findAll();
        console.log('All roles:', allRoles.map(r => r.dataValues));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

testRole();