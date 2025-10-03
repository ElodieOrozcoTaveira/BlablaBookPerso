import { DataTypes, Model, Optional  } from "sequelize";
import sequelize from '../config/database.js';
import Permission from './Permission.js';

// Definition des attributs du role
interface RoleAttributes {
    id_role: number;
    name: string;
    description: string;
    created_at: Date;
}

// Interface pour la creation (id_role et created_at sont auto-generes)
interface RoleCreationAttributes extends Optional<RoleAttributes, 'id_role' | 'created_at'> {}

// Classe du modele Role
class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id_role!: number;
    public name!: string;
    public description!: string;
    public created_at!: Date;
    
    // Associations Sequelize
    public Permissions?: Permission[];
}

// Initialisation du modele Role
Role.init(
    {
        id_role: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
            }
            },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [5, 255], // Longueur minimale de 5 caracteres
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Role',
        tableName: 'ROLE',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false, // Pas de champ updated_at
    }
);
    

export default Role;