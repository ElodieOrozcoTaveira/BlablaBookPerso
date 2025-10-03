import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Interface des attributs du genre
interface GenreAttributes {
    id_genre: number;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

//Interface pour la creation (certains champs sont auto-generes)
interface GenreCreationAttributes extends Optional<GenreAttributes, 'id_genre' | 'created_at' | 'updated_at'> {}

// Classe du modele Genre
class Genre extends Model<GenreAttributes, GenreCreationAttributes> implements GenreAttributes {
    public id_genre!: number;
    public name!: string;
    public description?: string;
    public created_at!: Date;
    public updated_at!: Date;
}

// Initialisation du modele Genre
Genre.init(
{
    id_genre: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,                    // AJOUTe: Contrainte UNIQUE comme dans le schema SQL
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true, // Optionnel
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Date de creation par defaut
    },

    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Date de mise a jour par defauts modifications
    }
},
{
    sequelize, // Instance Sequelize
    modelName: 'Genre',
    tableName: 'GENRE', // Nom de la table Singulier MAJUSCULE
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}
);

export default Genre;