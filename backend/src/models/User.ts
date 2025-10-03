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
    connected_at: Date;
    created_at: Date;    
    deleted_at?: Date;
}

//Interface pour la creation (certains champs sont auto-generes)
interface UserCreationAttributes extends Optional<UserAttributes, 'id_user' | 'id' | 'connected_at' | 'created_at' | 'deleted_at'> {}

//Classe du modele User
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id_user!: number;
    public id!: number;  // Alias virtuel pour l'API
    public firstname!: string;
    public lastname!: string;
    public username!: string;
    public email!: string;
    public password!: string;
    public connected_at!: Date;
    public created_at!: Date;    
    public deleted_at?: Date;
    
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
