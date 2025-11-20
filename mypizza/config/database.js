// Import du module mysql2 en version promise pour utiliser async/await
const mysql = require('mysql2/promise');

// Création d'un pool de connexions à la base de données
const pool = mysql.createPool({
    // Adresse du serveur MySQL (ici local)
    host: 'localhost',

    // Nom d'utilisateur pour se connecter à MySQL
    user: 'root',

    // Mot de passe pour l'utilisateur MySQL
    password: '', 

    // Nom de la base de données à utiliser
    database: 'pizzayo',

    // Attendre qu'une connexion soit disponible si le pool est saturé
    waitForConnections: true,

    // Nombre maximum de connexions simultanées dans le pool
    connectionLimit: 10,

    // Limite de requêtes en file d'attente (0 = illimité)
    queueLimit: 0
});

/**
 * Fonction utilitaire pour exécuter des requêtes SQL avec le pool
 * @param {string} sql - Requête SQL à exécuter
 * @param {Array<any>} params - Paramètres à injecter dans la requête (prévention injection SQL)
 * @returns {Promise<[rows: any, fields: any]>} - Retourne les lignes et les métadonnées
 */
const query = (sql, params) => {
    return pool.execute(sql, params);
};

// Export de la fonction query et du pool pour être utilisés dans les routes
module.exports = {
    query,
    pool
};
