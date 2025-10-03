import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Role from './Role.js';

// Definition des attributs de l'utilisateur
interface UserAttributes {
    id_user: number;
    id: number;  // Alias virtuel pour l'API
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    avatar_url?: string;
    connected_at: Date;
    created_at: Date;    
    deleted_at?: Date;
}

//Interface pour la creation (certains champs sont auto-generes)
interface UserCreationAttributes extends Optional<UserAttributes, 'id_user' | 'id' | 'avatar_url' | 'connected_at' | 'created_at' | 'deleted_at'> {}

//Classe du modele User
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    // Suppression des class fields publiques qui shadowing les getters/setters Sequelize
    // Les types sont définis dans l'interface UserAttributes
    declare id_user: number;
    declare id: number;  // Alias virtuel pour l'API
    declare firstname: string;
    declare lastname: string;
    declare username: string;
    declare email: string;
    declare password: string;
    declare avatar_url?: string;
    declare connected_at: Date;
    declare created_at: Date;    
    declare deleted_at?: Date;
    
    // Associations Sequelize
    public Roles?: Role[];
}

// Initialisation du modele User
User.init(
    {
        id_user: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // Alias virtuel pour compatibilite API
        id: {
            type: DataTypes.VIRTUAL,
            get(this: User) { 
                return this.getDataValue('id_user'); 
            }
        },
        firstname: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        avatar_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        connected_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },        
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },

    {
        sequelize, 
        modelName: 'User',    // Singular pour compatibilite adapter
        tableName: 'USER',
        timestamps: true, 
        createdAt: 'created_at',
        updatedAt: false,
        deletedAt: 'deleted_at',
        paranoid: true, // Active le mode "soft delete"
    }
)

export default User;
