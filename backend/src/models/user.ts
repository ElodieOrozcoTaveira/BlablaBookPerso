import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Hash Argon2 du mot de passe",
    },
    // Champ pour traquer la dernière connexion de l'utilisateur
    connected_at: {
      type: DataTypes.DATE,
      allowNull: true, // Null pour les utilisateurs qui ne se sont jamais connectés
    },
  },
  {
    sequelize: sequelize,
    modelName: "User", //nom du model
    tableName: "USER", //nom de la table en BDD
    // Active les timestamps automatiques (createdAt, updatedAt)
    timestamps: true,
    // Active le soft delete (deletedAt), supprime pas définitivement, au cas ou que l'user veut restaurer un livre, liste, compte
    paranoid: true,
    comment: "Comptes utilisateurs avec authentification Argon2",
    // Configuration des noms de colonnes pour correspondre à la BDD
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deletedAt", // La BDD utilise camelCase pour cette colonne
  }
);

export { User };
