import { 
    DataTypes, 
    Model, 
    Optional,
    BelongsToManySetAssociationsMixin,
    BelongsToManyGetAssociationsMixin
} from 'sequelize';
import sequelize from '../config/database';

// Interface des attributs du livre
interface BookAttributes {
    id_book: number;
    isbn?: string;                    // MODIFIe: ISBN peut être NULL (Open Library)
    title: string;
    description?: string;
    publication_year?: number;
    page_count?: number;
    language?: string;
    cover_url?: string;
    cover_local?: string;
    open_library_key?: string;       // IMPORTANT: Cle unique pour eviter doublons import
    created_at: Date;
    updated_at: Date;
}

// Interface pour la creation (certains champs sont auto-generes)
interface BookCreationAttributes extends Optional<BookAttributes, 'id_book' | 'created_at' | 'updated_at'> {}

// Classe du modele Book
class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
    //par defaut si on ne le specifie pas une propriete est public par defaut par TS. Je le rajoute ici par convention car plus loin dans le code on utilisera private.
    public id_book!: number;
    public isbn?: string;            // MODIFIe: ISBN peut être NULL
    public title!: string;
    public description?: string;
    public publication_year?: number;
    public page_count?: number;
    public language?: string;
    public cover_url?: string;
    public cover_local?: string;
    public open_library_key?: string;
    public created_at!: Date;
    public updated_at!: Date;

    // Mixins pour les associations Many-to-Many avec alias
    public setBookHasAuthors!: BelongsToManySetAssociationsMixin<any, number>;
    public getBookHasAuthors!: BelongsToManyGetAssociationsMixin<any>;
    public setBookHasGenres!: BelongsToManySetAssociationsMixin<any, number>;
    public getBookHasGenres!: BelongsToManyGetAssociationsMixin<any>;
}

// Initialisation du modele Book
Book.init(
{
    id_book: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    isbn: {
        type: DataTypes.STRING(13),
        allowNull: true,             // MODIFIe: NULL car souvent absent dans Open Library
        unique: true,
        validate: {
            isNumeric: {
                msg: 'ISBN doit contenir uniquement des chiffres'
            },
            len: {
                args: [10, 13],
                msg: 'ISBN doit faire entre 10 et 13 caracteres'
            }
        }
    },

    title: {
        type: DataTypes.TEXT,// le titre le plus long du monde fait 1433 caracteres
        allowNull: false,
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    publication_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: -3000, //ecritures anciennes
            max: new Date().getFullYear(),
        }
    },

    page_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
        }
    },

    language: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'en',          // MODIFIE: 'en' par defaut (Open Library = 'eng')
    },

    cover_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },

    cover_local: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },

    open_library_key: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
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
    modelName: 'Book',
    tableName: 'BOOK',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}
);

export default Book;