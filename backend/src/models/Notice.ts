import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Interface des attributs de l'avis
interface NoticeAttributes {
    id_notice: number;
    id_user: number;
    id_book: number;
    title?: string;
    content: string;
    is_spoiler: boolean;
    is_public: boolean;
    created_at: Date;
    updated_at: Date;
}

// Interface pour la creation (certains champs sont auto-generes)
interface NoticeCreationAttributes extends Optional<NoticeAttributes, 'id_notice' | 'created_at' | 'updated_at'> {}

// Classe du modele Notice
class Notice extends Model<NoticeAttributes, NoticeCreationAttributes> implements NoticeAttributes {
    public id_notice!: number;
    public id_user!: number;
    public id_book!: number;
    public title?: string;
    public content!: string;
    public is_spoiler!: boolean;
    public is_public!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
}

// Initialisation du modele Notice
Notice.init(
{
    id_notice: {
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

    id_book: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BOOK',
            key: 'id_book',
        }
    },

    title: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },

    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 2000],
        }
    },

    is_spoiler: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },

    is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    modelName: 'Notice',
    tableName: 'NOTICE',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}
);

export default Notice;