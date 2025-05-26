import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

let Attachments = sequelize.define('attachments', {
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
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'comments',
            key: 'id'
        }
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    mime_type: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'attachments',
    timestamps: true
});

export default Attachments;