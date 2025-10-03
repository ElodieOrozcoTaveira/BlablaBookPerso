import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Interface des attributs de la relation Book-Author
interface BookAuthorAttributes {
    id_book_author: number;
    id_book: number;
    id_author: number;
    created_at: Date;
}

// Interface pour la creation (certains champs sont auto-generes)
interface BookAuthorCreationAttributes extends Optional<BookAuthorAttributes, 'id_book_author' | 'created_at'> {}

// Classe du modele BookAuthor
class BookAuthor extends Model<BookAuthorAttributes, BookAuthorCreationAttributes> implements BookAuthorAttributes {
    public id_book_author!: number;
    public id_book!: number;
    public id_author!: number;
    public created_at!: Date;
}

// Initialisation du modele BookAuthor
BookAuthor.init(
{
    id_book_author: {
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

    id_author: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'AUTHOR',
            key: 'id_author',
        }
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
},
{
    sequelize,
    modelName: 'BookAuthor',
    tableName: 'BOOK_AUTHOR',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['id_book', 'id_author']
        }
    ]
}
);

export default BookAuthor;