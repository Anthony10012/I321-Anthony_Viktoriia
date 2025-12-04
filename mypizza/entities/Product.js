// entities/Product.js
const db = require('../config/database');

class Product {
    static create({ name, description, imageUrl, price }) {
        const sql = `INSERT INTO products (name, description, imageUrl, price, created_at, updated_at)
                 VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`;
        const params = [name, description || null, imageUrl || null, price];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                // fetch created row
                Product.findById(this.lastID).then(resolve).catch(reject);
            });
        });
    }

//Méthode qui sera appelée par le contrôleur dans le cas d'un Get (all)
    static findAll() {
        const sql = `SELECT * FROM products ORDER BY id DESC`;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

//Méthode qui sera appelée par le contrôleur dans le cas d'un Get by id
    static findById(id) {
        const sql = `SELECT * FROM products WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

//Méthode qui sera appelée par le contrôleur dans le cas d'un PUT
    static update(id, { name, description, imageUrl, price }) {
        const sql = `
      UPDATE products
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          imageUrl = COALESCE(?, imageUrl),
          price = COALESCE(?, price),
          updated_at = datetime('now')
      WHERE id = ?
    `;
        const params = [name, description, imageUrl, price, id];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return resolve(null);
                Product.findById(id).then(resolve).catch(reject);
            });
        });
    }

//Méthode qui sera appelée par le contrôleur dans le cas d'un Delete by ID
    static delete(id) {
        const sql = `DELETE FROM products WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // number of rows deleted
            });
        });
    }
}

module.exports = Product;
