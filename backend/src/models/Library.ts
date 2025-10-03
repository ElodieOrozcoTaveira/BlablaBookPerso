import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

//Interface des attributs de la bibliotheque
interface LibraryAttributes {
    id_library: number;
    name: string;
    description?: string;
    is_public: boolean;
    id_user: number; // FK vers User
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date; // Pour soft delete
}

// Interface pour la creation (certains champs sont auto-generes)
interface LibraryCreationAttributes extends Optional<LibraryAttributes, 'id_library' | 'created_at' | 'updated_at' | 'deleted_at'> {}


// Classe du modele Library
class Library extends Model<LibraryAttributes, LibraryCreationAttributes> implements LibraryAttributes {
    public id_library!: number;
    public name!: string;
    public description?: string;
    public is_public!: boolean;
    public id_user!: number; // FK vers User
    public created_at!: Date;
    public updated_at!: Date;
    public deleted_at?: Date; // Pour soft delete
}

// Initialisation du modele Library
Library.init(
{
        id_library: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,            
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true, // Optionnel
        },

        is_public: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false, // Par defaut, la bibliotheque n'est pas publique
        },

        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'USER', // Nom de la table User
                key: 'id_user',
            }
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW, // Date de creation par defaut
        },

        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW, // Date de mise a jour par defaut
        },

        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true, // Pour soft delete
        }
    },
    {
        sequelize,
        modelName: 'Library',
        tableName: 'LIBRARY',
        timestamps: true, // Pour gerer created_at et updated_at
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at', // Pour soft delete
        paranoid: true, // Active le mode "soft delete"
    }
);

export default Library;