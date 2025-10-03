import sequelize from './src/config/database.js';
import Role from './src/models/Role.js';
import User from './src/models/User.js';
import UserRole from './src/models/UserRole.js';

async function testUserRoleCreation() {
    try {
        console.log('🔍 Connexion à la base...');
        await sequelize.authenticate();
        
        console.log('🔍 Recherche du rôle "user"...');
        const userRole = await Role.findOne({ where: { name: 'user' } });
        
        if (!userRole) {
            console.log('❌ Rôle "user" non trouvé !');
            return;
        }

        console.log('✅ Rôle trouvé:', {
            id_role: userRole.id_role,
            name: userRole.name,
            description: userRole.description
        });

        console.log('🔍 Accès aux propriétés du rôle:');
        console.log('  - userRole.id_role =', userRole.id_role);
        console.log('  - userRole.get("id_role") =', userRole.get('id_role'));
        console.log('  - userRole.dataValues.id_role =', userRole.dataValues?.id_role);

        // Cherchons un utilisateur existant pour le test
        console.log('\n🔍 Recherche d\'un utilisateur...');
        const user = await User.findOne();
        
        if (!user) {
            console.log('❌ Aucun utilisateur trouvé !');
            return;
        }

        console.log('✅ Utilisateur trouvé:', {
            id_user: user.id_user,
            username: user.username
        });

        // Vérifions si une relation UserRole existe déjà
        console.log('\n🔍 Vérification relation UserRole existante...');
        const existingUserRole = await UserRole.findOne({
            where: {
                id_user: user.id_user,
                id_role: userRole.get('id_role')
            }
        });

        if (existingUserRole) {
            console.log('✅ Relation UserRole existante trouvée:', {
                id_user_role: existingUserRole.id_user_role,
                id_user: existingUserRole.id_user,
                id_role: existingUserRole.id_role
            });
        } else {
            console.log('ℹ️ Aucune relation UserRole existante');

            // Test de création UserRole
            console.log('\n🧪 Test création UserRole...');
            try {
                const newUserRole = await UserRole.create({
                    id_user: user.id_user,
                    id_role: userRole.get('id_role')
                });
                
                console.log('✅ UserRole créé avec succès:', {
                    id_user_role: newUserRole.id_user_role,
                    id_user: newUserRole.id_user,
                    id_role: newUserRole.id_role
                });
            } catch (createError) {
                console.log('❌ Erreur création UserRole:', createError.message);
                if (createError.sql) {
                    console.log('SQL:', createError.sql);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

testUserRoleCreation();
