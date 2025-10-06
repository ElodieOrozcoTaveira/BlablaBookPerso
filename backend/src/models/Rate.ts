import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Rate extends Model {}

Rate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    published_At: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Rate",
    tableName: "RATE",
    timestamps: true,
  }
);

export { Rate };
