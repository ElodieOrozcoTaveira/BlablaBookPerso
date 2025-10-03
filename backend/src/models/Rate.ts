import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Interface des attributs de la note
interface RateAttributes {
    id_rate: number;
    id_user: number;
    id_book: number;
    rating: number;
    created_at: Date;
    updated_at: Date;
}

// Interface pour la creation (certains champs sont auto-generes)
interface RateCreationAttributes extends Optional<RateAttributes, 'id_rate' | 'created_at' | 'updated_at'> {}

// Classe du modele Rate
class Rate extends Model<RateAttributes, RateCreationAttributes> implements RateAttributes {
    public id_rate!: number;
    public id_user!: number;
    public id_book!: number;
    public rating!: number;
    public created_at!: Date;
    public updated_at!: Date;
}

// Initialisation du modele Rate
Rate.init(
{
    id_rate: {
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

    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        }
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
    modelName: 'Rate',
    tableName: 'RATE',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['id_user', 'id_book']
        }
    ]
}
);

export default Rate;