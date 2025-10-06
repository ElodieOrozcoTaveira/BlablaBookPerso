import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Authors extends Model {}

Authors.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Authors",
    tableName: "AUTHOR",
    comment: "Répertoire des auteurs de livres",
  }
);

export { Authors };
