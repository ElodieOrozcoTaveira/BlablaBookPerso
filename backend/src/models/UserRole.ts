import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class UserRole extends Model {}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "USER", //nom de la table
        key: "id_user",
      },
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ROLE", //nom de la table
        key: "id_role",
      },
    },
  },
  {
    sequelize: sequelize,
    modelName: "UserRole",
    tableName: "USER_ROLE",
    indexes: [
      {
        unique: true,
        fields: ["id_user", "id_role"], //un user ne peut avoir le meme role qu'une seule fois
      },
    ],
  }
);

export { UserRole };
