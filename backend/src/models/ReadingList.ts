import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Interface des attributs de la liste de lecture
interface ReadingListAttributes {
    id_reading_list: number;
    id_library: number;
    id_book: number;
    reading_status: 'to_read' | 'reading' | 'read' | 'abandoned';
    added_at: Date;
    started_at?: Date;
    finished_at?: Date;
    created_at: Date;
    updated_at: Date;
}

// Interface pour la creation (certains champs sont auto-generes)
interface ReadingListCreationAttributes extends Optional<ReadingListAttributes, 'id_reading_list' | 'created_at' | 'updated_at'> {}

// Classe du modele ReadingList
class ReadingList extends Model<ReadingListAttributes, ReadingListCreationAttributes> implements ReadingListAttributes {
    public id_reading_list!: number;
    public id_library!: number;
    public id_book!: number;
    public reading_status!: 'to_read' | 'reading' | 'read' | 'abandoned';
    public added_at!: Date;
    public started_at?: Date;
    public finished_at?: Date;
    public created_at!: Date;
    public updated_at!: Date;
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

    reading_status: {
        type: DataTypes.ENUM('to_read', 'reading', 'read', 'abandoned'),
        allowNull: false,
        defaultValue: 'to_read',
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
            unique: true,
            fields: ['id_library', 'id_book']
        }
    ]
}
);

export default ReadingList;