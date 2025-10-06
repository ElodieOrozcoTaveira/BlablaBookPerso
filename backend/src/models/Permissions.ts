import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Permissions extends Model {}

Permissions.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description de l action autorisée",
    },
  },
  {
    sequelize: sequelize,
    modelName: "Permissions",
    tableName: "PERMISSION",
    comment: "Permissions granulaires du système",
  }
);

export { Permissions };
