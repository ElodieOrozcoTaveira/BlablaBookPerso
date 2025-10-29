import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";
class Library extends Model {
}
Library.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_library", // Mapping vers la colonne id_library en BDD
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "USER",
            key: "id_user",
        },
    },
}, {
    sequelize: sequelize,
    modelName: "Library",
    tableName: "LIBRARY",
    timestamps: true, // ajoute created_at, updates_at et deleted_at
    paranoid: true, //active le soft delete
    comment: "Bibliothèques personnelles des utilisateurs",
});
export { Library };
//# sourceMappingURL=Library.js.map