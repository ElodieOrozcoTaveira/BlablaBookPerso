import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Library extends Model {}

Library.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Library",
    tableName: "LIBRARY",
    timestamps: true, // ajoute created_at, updates_at et deleted_at
    paranoid: true, //active le soft delete
    comment: "Bibliothèques personnelles des utilisateurs",
  }
);

export { Library };
