import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database.js';

// Interface des attributs de la liste de lecture
interface ReadingListAttributes {
    id_reading_list: number;
    id_library: number;
    id_book: number;
    list_name?: string; // Nom de la liste (NULL = collection permanente)
    reading_status: 'owned' | 'to_read' | 'reading' | 'read' | 'abandoned';
    added_at: Date;
    started_at?: Date;
    finished_at?: Date;
    created_at: Date;
    updated_at: Date;
}

// Interface pour la creation (certains champs sont auto-generes)
interface ReadingListCreationAttributes extends Optional<ReadingListAttributes, 'id_reading_list' | 'created_at' | 'updated_at'> {}

// Classe du modele ReadingList
class ReadingList extends Model<ReadingListAttributes, ReadingListCreationAttributes> {
    // Removed public property declarations to avoid shadowing Sequelize getters/setters
    // Properties are accessed via dataValues or get() method
}

// Initialisation du modele ReadingList
ReadingList.init(
{
    id_reading_list: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    id_library: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'LIBRARY',
            key: 'id_library',
        }
    },

    id_book: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BOOK',
            key: 'id_book',
        }
    },

    list_name: {
        type: DataTypes.STRING(100),
        allowNull: true, // NULL = collection permanente
    },

    reading_status: {
        type: DataTypes.ENUM('owned', 'to_read', 'reading', 'read', 'abandoned'),
        allowNull: false,
        defaultValue: 'owned',
    },

    added_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },

    started_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    finished_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
    modelName: 'ReadingList',
    tableName: 'READING_LIST',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            // Un livre peut être dans plusieurs listes mais pas en double dans la même liste
            unique: true,
            fields: ['id_library', 'id_book', 'list_name'],
            name: 'reading_list_unique_per_list'
        }
    ]
}
);

export default ReadingList;