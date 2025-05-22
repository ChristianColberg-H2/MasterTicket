import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import dummy from './dummy.js';

dotenv.config();

let sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: (msg) => {
        console.log(`[ORM]\t\t${msg}`);
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('[CON]\t\tDatabase connection has been established successfully.\n');
    } catch (e) {
        console.log('[CON]\t\tUnable to connect to the database:', e);
    }

    try {
        await sequelize.sync();
        console.log('[ORM]\t\tDatabase models have been synchronized successfully.\n');
    } catch (e) {
        console.log('[ORM]\t\tUnable to synchronize the database models:', e);
    }

    try {
        await dummy();
        console.log('[ORM]\t\tDummy data has been inserted successfully.\n');
    } catch (e) {
        console.log('[ORM]\t\tUnable to insert dummy data:', e);
    }
})();

export default sequelize;