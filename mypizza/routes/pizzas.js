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
 * /pizzas/jour:
 *   get:
 *     summary: Récupérer la pizza du jour
 *     tags: [Pizzas]
 *     responses:
 *       200:
 *         description: Pizza du jour trouvée
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
 *       404:
 *         description: Pizza du jour non définie ou introuvable
 *       500:
 *         description: Erreur serveur lors de la récupération de la pizza du jour
 */

//Route GET pour récupérer la pizza du jour
router.get('/jour', async (req, res) => {
    try{
        // Récupère la pizza du jour
        const [daily]= await query('SELECT pizzas_idpizzas AS idpizza FROM pizza_du_jour WHERE id = 1');
        if (daily.length === 0){
            return res.status(404).json( {message:"Pizza du jour non définie."});

        }
        const pizzaId = daily[0].idpizza;
        // Récupère les détails
        const [rows] = await query(
            'SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?',
            [pizzaId]
        );
        if (rows.length === 0){
            return res.status(404).json({ message: "Pizza du jour introuvable dans la liste des pizzas." });
        }
        res.status(200).json(rows[0]);

    }catch (err){
        console.error("Erreur récupération pizza du jour:",err);
        res.status(500).json({ message: "Impossible de récupérer la pizza du jour." });
    }
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
 *               name:
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
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *
 *       400:
 *         description: Champs requis manquants (name, price)
 *
 *       500:
 *         description:Erreur interne : impossible de créer la pizza.
 *
 */
// Route POST pour créer une nouvelle pizza
router.post('/', async (req, res) => {
    try{
        const { name, price } = req.body;
        if (!name || !price) return res.status(400).json({ message: "Champs requis manquants: name, price." });
        const sql = 'INSERT INTO pizzas (name, price) VALUES (?, ?)';
        const [result] = await query(sql, [name, price]);
        const newId = result.insertId;
        const [rows] = await query('SELECT idpizzas AS id, name, price FROM pizzas WHERE idpizzas = ?', [newId]);
        res.status(201).json(rows[0]);
    }catch (err) {
        console.error("Erreur lors de la création d'une pizza :", err);
        res.status(500).json({ message: "Erreur interne : impossible de créer la pizza." });
    }

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
 * /pizzas/{id}/price:
 *   patch:
 *     summary: Mettre à jour uniquement le prix d'une pizza
 *     tags: [Pizzas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la pizza à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *             properties:
 *               price:
 *                 type: number
 *                 example: 13.50
 *     responses:
 *       200:
 *         description: Prix mis à jour avec succès
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
 *       400:
 *         description: Champ 'price' manquant ou invalide
 *       404:
 *         description: Pizza non trouvée
 *       500:
 *         description: Erreur serveur lors de la mise à jour
 *
 *
 *
 *
 */
// Route Patch pour mettre à jour le prix d'une pizza
router.patch('/:id/price', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { price } = req.body;
    if (isNaN(id)){
        return res.status(400).json({message:"ID invalide"});
    }
    if (price === undefined || price === null){
        return res.status(400).json({message:"le champ 'price' est requis."});
    }
    try{
        // Vérifie que la pizza existe
        const [existing] = await query('SELECT * FROM pizzas WHERE idpizzas = ?', [id]);
        if (existing.length === 0){
            return res.status(404).json({ message: "Pizza non trouvée." });
        }
        // Mise à jour du prix
        await query('UPDATE pizzas SET price = ? WHERE idpizzas = ?', [price, id]);

        // Retourne la pizza mise à jour
        const [rows] = await query('SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?', [id]);
        res.status(200).json(rows[0]);
    }catch(err){
        console.error(`Erreur mise à jour du prix pour la pizza ${id} :`, err);
        return res.status(500).json({message:"Impossible de mettre à jour le prix pour la pizza."});
    }

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
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Pizza non trouvée
 *       500:
 *         description: Erreur serveur
 */
// Route DELETE pour supprimer une pizza
router.delete('/:id', async (req, res) => {
    try{
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID invalide." });
        }
        //Suppresion de la pizza
        const [result] = await query('DELETE FROM pizzas WHERE idpizzas = ?', [id]);
        if (result.affectedRows === 0){
            return res.status(404).json({ message: "Pizza non trouvée." });
        }
        res.status(204).send();

    }catch(err){
        console.error("Erreur lors de la suppression de la pizza :", err);
        return res.status(500).json({message:"Erreur interne du serveur"});
    }

});

// Exporter le routeur pour l'utiliser dans app.js
module.exports = router;
