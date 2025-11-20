const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pizzayo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * @param {string} sql 
 * @param {Array<any>} params 
 * @returns {Promise<[rows: any, fields: any]>}
 */
const query = (sql, params) => {
    return pool.execute(sql, params);
};

module.exports = {
    query,
    pool
};

