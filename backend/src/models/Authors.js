import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";
class Authors extends Model {
}
Authors.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_author", // Mapping vers la colonne id_author en BDD
    },
    firstname: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    lastname: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    sequelize: sequelize,
    modelName: "Authors",
    tableName: "AUTHOR",
    timestamps: true, // Active les timestamps automatiques
    createdAt: "created_at", // Nom de colonne dans la BDD
    updatedAt: "updated_at", // Nom de colonne dans la BDD
    comment: "Répertoire des auteurs de livres",
});
export { Authors };
//# sourceMappingURL=Authors.js.map