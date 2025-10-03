import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Interface des attributs de la collection de listes de lecture
interface ReadingListCollectionAttributes {
    id_reading_list_collection: number;
    id_user: number;
    name: string;
    description?: string;
    is_public: boolean;
    created_at: Date;
    updated_at: Date;
}

// Interface pour la creation
interface ReadingListCollectionCreationAttributes extends Optional<ReadingListCollectionAttributes, 'id_reading_list_collection' | 'description' | 'created_at' | 'updated_at'> {}

// Classe du modele ReadingListCollection
class ReadingListCollection extends Model<ReadingListCollectionAttributes, ReadingListCollectionCreationAttributes> implements ReadingListCollectionAttributes {
    public id_reading_list_collection!: number;
    public id_user!: number;
    public name!: string;
    public description?: string;
    public is_public!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
}

// Initialisation du modele ReadingListCollection
ReadingListCollection.init(
{
    id_reading_list_collection: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'USER',
            key: 'id_user',
        }
    },

    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
},
{
    sequelize,
    modelName: 'ReadingListCollection',
    tableName: 'READING_LIST_COLLECTION',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['id_user', 'name']
        }
    ]
}
);

export default ReadingListCollection;