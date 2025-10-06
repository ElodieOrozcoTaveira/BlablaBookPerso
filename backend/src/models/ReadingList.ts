import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class ReadingList extends Model {}

ReadingList.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Catégorie thématique de la liste",
    },
    statut: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "TRUE=active, FALSE=inactive",
    },
    created_At: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_At: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_At: {
      type: DataTypes.DATE,
      allowNull: true, // pour soft delete
    },
  },
  {
    sequelize: sequelize,
    modelName: "ReadingList",
    tableName: "READING_LIST",
    comment: "Bibliothèques personnelles des utilisateurs",
    timestamps: true, //gère created_at t updated_at
    paranoid: true, // active le soft delete
  }
);

export { ReadingList };
