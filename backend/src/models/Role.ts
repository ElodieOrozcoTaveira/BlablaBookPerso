import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Role",
    tableName: "ROLE",
    timestamps: true,
    createdAt: "created_at",
    comment: "Rôles du système RBAC",
  }
);

export { Role };
