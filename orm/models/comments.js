import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

let Comments = sequelize.define('comments', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ticket_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tickets',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_internal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'comments',
    timestamps: true
});

export default Comments;