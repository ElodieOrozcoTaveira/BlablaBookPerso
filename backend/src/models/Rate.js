import { sequelize } from "../db/sequelize.js";
import { Model, DataTypes } from "sequelize";
class Rate extends Model {
}
Rate.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_rate",
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "USER",
            key: "id_user",
        },
    },
    id_book: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "BOOK",
            key: "id_book",
        },
    },
    id_reading_list: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "READING_LIST",
            key: "id_reading_list",
        },
        comment: "Note optionnelle sur une liste",
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
        comment: "Note de 1 à 5 étoiles",
    },
    published_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: sequelize,
    modelName: "Rate",
    tableName: "RATE",
    timestamps: true,
    createdAt: "published_at",
    updatedAt: "updated_at",
    comment: "Système de notation 1-5 étoiles",
});
export { Rate };
//# sourceMappingURL=Rate.js.map