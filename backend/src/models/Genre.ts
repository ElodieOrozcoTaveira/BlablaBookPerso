import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Genre extends Model {}

Genre.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Genre",
    tableName: "GENRE",
    comment: "Classification des genres littéraires",
  }
);

export { Genre };
