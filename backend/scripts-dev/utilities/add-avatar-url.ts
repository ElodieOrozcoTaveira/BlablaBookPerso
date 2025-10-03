import sequelize from '../../src/config/database.js';
import { DataTypes } from 'sequelize';

async function addAvatarUrlColumn(): Promise<void> {
    try {
        console.log('Ajout de la colonne avatar_url à la table USER...');
        
        await sequelize.getQueryInterface().addColumn('USER', 'avatar_url', {
            type: DataTypes.TEXT,
            allowNull: true,
        });
        
        console.log('Colonne avatar_url ajoutée avec succès !');
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la colonne avatar_url:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Executer la migration si ce script est appele directement
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
    addAvatarUrlColumn()
        .then(() => {
            console.log('Migration terminée avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Echec de la migration:', error);
            process.exit(1);
        });
}

export default addAvatarUrlColumn;