import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

// Interface des attributs de la relation Book-Genre
interface BookGenreAttributes {
    id_book_genre: number;
    id_book: number;
    id_genre: number;
    created_at: Date;
}

// Interface pour la creation (certains champs sont auto-generes)
interface BookGenreCreationAttributes extends Optional<BookGenreAttributes, 'id_book_genre' | 'created_at'> {}

// Classe du modele BookGenre
class BookGenre extends Model<BookGenreAttributes, BookGenreCreationAttributes> implements BookGenreAttributes {
    public id_book_genre!: number;
    public id_book!: number;
    public id_genre!: number;
    public created_at!: Date;
}

// Initialisation du modele BookGenre
BookGenre.init(
{
    id_book_genre: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    id_book: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BOOK',
            key: 'id_book',
        }
    },

    id_genre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'GENRE',
            key: 'id_genre',
        }
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
},
{
    sequelize,
    modelName: 'BookGenre',
    tableName: 'BOOK_GENRE',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['id_book', 'id_genre']
        }
    ]
}
);

export default BookGenre;