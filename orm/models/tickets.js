import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

let Tickets = sequelize.define('tickets', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    assigned_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'statuses',
            key: 'id'
        }
    },
    priority_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'priorities',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    tableName: 'tickets',
    timestamps: true
});

export default Tickets;