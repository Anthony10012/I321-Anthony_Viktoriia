// Importer le module express pour créer le serveur et gérer les routes
const express = require('express');

// Créer un routeur express pour gérer les routes spécifiques aux pizzas
const router = express.Router();

// Importer la fonction query depuis la configuration de la base de données pour exécuter des requêtes SQL
const { query } = require('../config/database');

/**
 * @swagger
 * /pizzas/{id}/ingredients:
 *   get:
 *     summary: Récupérer une pizza avec tous ses ingrédients
 *     tags: [Pizzas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la pizza
 *     responses:
 *       200:
 *         description: Pizza avec ses ingrédients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 price:
 *                   type: number
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       404:
 *         description: Pizza ou ingrédients non trouvés
 */
router.get('/:id/ingredients', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

    try {
        // Récupérer la pizza
        const [pizzaRows] = await query(
            'SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?',
            [id]
        );

        if (pizzaRows.length === 0) return res.status(404).json({ message: "Pizza non trouvée." });

        // Récupérer les ingrédients de cette pizza
        const [ingredientsRows] = await query(
            `SELECT i.idingredients AS id, i.name
             FROM ingredients i
             JOIN pizzas_has_ingredients pi
             ON i.idingredients = pi.ingredients_idingredients
             WHERE pi.pizzas_idpizzas = ?
             ORDER BY i.idingredients`,
            [id]
        );

        // Ajouter les ingrédients à l'objet pizza
        const pizzaWithIngredients = {
            ...pizzaRows[0],
            ingredients: ingredientsRows
        };

        res.status(200).json(pizzaWithIngredients);
    } catch (err) {
        console.error(`Erreur récupération pizza et ses ingrédients ID ${id}:`, err);
        res.status(500).json({ message: "Impossible de récupérer la pizza et ses ingrédients." });
    }
});


/**
 * @swagger
 * /pizzas:
 *   get:
 *     summary: Récupérer toutes les pizzas
 *     tags: [Pizzas]
 *     responses:
 *       200:
 *         description: Liste de toutes les pizzas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   price:
 *                     type: number
 */
// Route GET pour récupérer toutes les pizzas
router.get('/', async (req, res) => {
    const sql = 'SELECT idpizzas AS id, name AS title, price FROM pizzas ORDER BY idpizzas;';
    const [rows] = await query(sql);
    res.status(200).json(rows);
});

/**
 * @swagger
 * /pizzas:
 *   post:
 *     summary: Créer une nouvelle pizza
 *     tags: [Pizzas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Pizza créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 price:
 *                   type: number
 */
// Route POST pour créer une nouvelle pizza
router.post('/', async (req, res) => {
    const { title, price } = req.body;
    if (!title || !price) return res.status(400).json({ message: "Champs requis manquants: title, price." });
    const sql = 'INSERT INTO pizzas (name, price) VALUES (?, ?)';
    const [result] = await query(sql, [title, price]);
    const newId = result.insertId;
    const [rows] = await query('SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?', [newId]);
    res.status(201).json(rows[0]);
});

/**
 * @swagger
 * /pizzas/{id}:
 *   get:
 *     summary: Récupérer une pizza par ID
 *     tags: [Pizzas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la pizza
 *     responses:
 *       200:
 *         description: Pizza trouvée
 *       404:
 *         description: Pizza non trouvée
 */
// Route GET pour récupérer une pizza spécifique par son ID
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const sql = 'SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?';
    const [rows] = await query(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Pizza non trouvée." });
    res.status(200).json(rows[0]);
});

/**
 * @swagger
 * /pizzas/{id}:
 *   put:
 *     summary: Mettre à jour une pizza existante
 *     tags: [Pizzas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la pizza
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pizza mise à jour
 *       404:
 *         description: Pizza non trouvée
 */
// Route PUT pour mettre à jour une pizza existante
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, price } = req.body;
    const [existing] = await query('SELECT * FROM pizzas WHERE idpizzas = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: "Pizza non trouvée." });
    const updatedTitle = title || existing[0].name;
    const updatedPrice = price || existing[0].price;
    await query('UPDATE pizzas SET name = ?, price = ? WHERE idpizzas = ?', [updatedTitle, updatedPrice, id]);
    const [rows] = await query('SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?', [id]);
    res.status(200).json(rows[0]);
});

/**
 * @swagger
 * /pizzas/{id}:
 *   delete:
 *     summary: Supprimer une pizza
 *     tags: [Pizzas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la pizza
 *     responses:
 *       204:
 *         description: Pizza supprimée
 *       404:
 *         description: Pizza non trouvée
 */
// Route DELETE pour supprimer une pizza
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const [result] = await query('DELETE FROM pizzas WHERE idpizzas = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Pizza non trouvée." });
    res.status(204).send();
});

// Exporter le routeur pour l'utiliser dans app.js
module.exports = router;
