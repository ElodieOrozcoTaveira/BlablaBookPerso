import { DataTypes, Model, Optional } from "sequelize";
import sequelize from '../config/database.js';


// Definition des attributs de la permission
interface PermissionAttributes {
    id_permission: number;
    label: string;
    action?: string;
}

// Interface pour la creation (id_permission est auto-genere)
interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id_permission'> {}

// Classe du modele Permission
class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
    public id_permission!: number;
    public label!: string;
    public action?: string;
}

// Initialisation du modele Permission
Permission.init(
{
    id_permission: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    label: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isUppercase: true, // Convention: CREATE, READ, UPDATE, DELETE
        }
    },
    action: {
        type: DataTypes.TEXT,
        allowNull: true, // Action peut etre optionnelle
        validate: {
            len: [0, 255], // Longueur maximale de 255 caracteres
        }
    },
},

{
    sequelize,
    modelName: 'Permission',
    tableName: 'PERMISSION',
    timestamps: false, // Pas de champs created_at ou updated_at
}
);

export default Permission;