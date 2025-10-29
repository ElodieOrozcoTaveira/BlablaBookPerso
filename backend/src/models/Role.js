import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";
class Role extends Model {
}
Role.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_role', // Mapping vers la colonne id_role en BDD
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: sequelize,
    modelName: "Role",
    tableName: "ROLE",
    timestamps: true,
    createdAt: "created_at", // Nom de colonne dans la BDD
    updatedAt: "updated_at", // Nom de colonne dans la BDD
    comment: "Rôles du système RBAC",
});
export { Role };
//# sourceMappingURL=Role.js.map