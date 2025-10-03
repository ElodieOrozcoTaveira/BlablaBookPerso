import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface AuthorAttributes {
    id_author: number;
    name: string;
    bio?: string;           // Renomme de biography → bio
    birth_date?: Date;      // Renomme de birth_year → birth_date (DATE complete)
    death_date?: Date;      // Renomme de death_year → death_date (DATE complete)
    created_at: Date;
    updated_at: Date;
}

interface AuthorCreationAttributes extends Optional<AuthorAttributes, 'id_author' | 'created_at' | 'updated_at'> {}

class Author extends Model<AuthorAttributes, AuthorCreationAttributes> implements AuthorAttributes {
    public id_author!: number;
    public name!: string;
    public bio?: string;           // Renomme de biography → bio
    public birth_date?: Date;      // Renomme de birth_year → birth_date (DATE complete)
    public death_date?: Date;      // Renomme de death_year → death_date (DATE complete)
    public created_at!: Date;
    public updated_at!: Date;
}

Author.init(
{
    id_author: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true, // Optionnel - correspond au champ "bio" d'Open Library
    },
    birth_date: {
        type: DataTypes.DATEONLY, // DATE sans heure
        allowNull: true,
        validate: {
            isDate: true,
            isBefore: new Date().toISOString(), // Pas de naissance dans le futur
        }
    },
    death_date: {
        type: DataTypes.DATEONLY, // DATE sans heure
        allowNull: true,
        validate: {
            isDate: true,
            isBefore: new Date().toISOString(), // Pas de deces dans le futur
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
},
{
    sequelize,
    modelName: 'Author',
    tableName: 'AUTHOR',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
        // Validation personnalisee : la date de deces doit être apres la naissance
        deathAfterBirth() {
            if (this.birth_date && this.death_date && this.death_date < this.birth_date) {
                throw new Error('La date de deces ne peut pas être anterieure a la date de naissance');
            }
        }
    }
}
);

export default Author;
