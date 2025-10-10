import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class RolePermission extends Model {}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ROLE",
        key: "id_role",
      },
    },
    id_permission: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "PERMISSION",
        key: "id_permission",
      },
    },
  },
  {
    sequelize: sequelize,
    modelName: "RolePermission",
    tableName: "ROLE_PERMISSION",
    indexes: [
      {
        unique: true,
        fields: ["id_role", "id_permission"], //un role ne peut la même permission qu'une seule fois
      },
    ],
    comment: "Permissions attribuées aux rôles",
  }
);

export { RolePermission };
