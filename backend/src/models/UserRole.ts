import { DataTypes, Model, Optional } from "sequelize";
import sequelize from '../config/database.js';

// Definition des attributs User-Role
interface UserRoleAttributes {
    id_user_role: number;
    id_user: number;
    id_role: number;
}

// Interface pour la creation (id_user_role est auto-genere)
interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id_user_role'> {}

// Classe du modele UserRole
class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
    declare id_user_role: number;
    declare id_user: number;
    declare id_role: number;
}

// Initialisation du modele UserRole
UserRole.init(
    {
        id_user_role: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'USER', // Nom de la table User (renommee)
                key: 'id_user',
            },
        },
        id_role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ROLE', // Nom de la table Role
                key: 'id_role',
            },
        },
    },
    {
        sequelize,
        modelName: 'UserRole',
        tableName: 'USER_ROLE',
        timestamps: false, // Pas de champs created_at ou updated_at
        indexes: [
            {
                unique: true,
                fields: ['id_user', 'id_role']//Un user ne peut avoir le meme role qu'une seule fois
                },
        ],
    }
);

export default UserRole;