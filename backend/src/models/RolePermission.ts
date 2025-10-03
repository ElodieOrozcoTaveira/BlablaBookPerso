import { DataTypes, Model, Optional } from "sequelize";
import sequelize from '../config/database.js';

// Definition des attributs de la liaison Role-Permission
interface RolePermissionAttributes {
    id_role_permission: number;
    id_role: number;
    id_permission: number;
}

// Interface pour la creation (id_role_permission est auto-genere)
interface RolePermissionCreationAttributes extends Optional<RolePermissionAttributes, 'id_role_permission'> {}

// Classe du modele RolePermission
class RolePermission extends Model<RolePermissionAttributes, RolePermissionCreationAttributes> implements RolePermissionAttributes {
    declare id_role_permission: number;
    declare id_role: number;
    declare id_permission: number;
}

// Initialisation du modele RolePermission
RolePermission.init(
    {
        id_role_permission: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ROLE', // Nom de la table Role
                key: 'id_role',
            },
        },
        id_permission: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'PERMISSION', // Nom de la table Permission
                key: 'id_permission',
            },
        },
    },
    {
        sequelize,
        modelName: 'RolePermission',
        tableName: 'ROLE_PERMISSION',
        timestamps: false, // Pas de champs created_at ou updated_at
        indexes: [
            {
                unique: true,
                fields: ['id_role', 'id_permission'] // Un role ne peut avoir la meme permission qu'une seule fois
            },
        ],
    }
);

export default RolePermission;