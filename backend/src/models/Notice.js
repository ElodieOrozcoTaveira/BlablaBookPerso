import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";
class Notice extends Model {
}
Notice.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_notice', // Mapping vers la colonne id_notice en BDD
    },
    comment: {
        type: DataTypes.TEXT, //text pour du plus de caractères
        allowNull: false,
    },
}, {
    sequelize: sequelize,
    modelName: "Notice",
    tableName: "NOTICE",
    timestamps: true, // Active createdAt et updatedAt automatiques
    createdAt: "published_at",
    updatedAt: "updated_at",
    comment: "Avis et critiques des utilisateurs sur les livres",
});
export { Notice };
//# sourceMappingURL=Notice.js.map