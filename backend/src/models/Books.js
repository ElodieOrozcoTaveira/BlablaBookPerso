import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";
class Books extends Model {
}
Books.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_book", // Mapping vers la colonne id_book en BDD
    },
    isbn: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        comment: "Code ISBN-10 ou ISBN-13",
    },
    title: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    image: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indique si une image est disponible",
    },
    cover_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "URL de la couverture du livre",
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    nb_pages: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
        },
    },
    published_at: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    sequelize: sequelize,
    modelName: "Books",
    tableName: "BOOK",
    comment: "Catalogue des livres de l application",
});
export { Books };
//# sourceMappingURL=Books.js.map