import sequelize from './src/config/database.js';
import Role from './src/models/Role.js';

async function checkRoles() {
    try {
        console.log('🔍 Connexion à la base...');
        await sequelize.authenticate();
        
        console.log('🔍 Recherche des rôles...');
        const roles = await Role.findAll();
        
        console.log('📊 Rôles trouvés:');
        roles.forEach(role => {
            console.log(`  - ID: ${role.id_role}, Name: "${role.name}", Description: "${role.description}"`);
        });
        
        console.log('\n🔍 Recherche spécifique du rôle "user"...');
        const userRole = await Role.findOne({ where: { name: 'user' } });
        
        if (userRole) {
            console.log('✅ Rôle "user" trouvé:', userRole.dataValues);
        } else {
            console.log('❌ Rôle "user" non trouvé !');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

checkRoles();
