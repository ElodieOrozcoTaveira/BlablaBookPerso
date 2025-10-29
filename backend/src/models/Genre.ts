import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Genre extends Model {}

Genre.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_genre', // Mapping vers la colonne id_genre en BDD
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
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Classification des genres littéraires",
  }
);

export { Genre };
