import { client } from "../db/client.js";
import { Model, DataTypes } from "sequelize";

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        
    },
    {
        sequelize: client,
        modelName: 'user',
        tableName: 'User'
    }
);

export { User };