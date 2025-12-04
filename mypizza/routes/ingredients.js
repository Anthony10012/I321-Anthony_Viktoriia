// Import du module Express pour créer des routes
const express = require('express');
// Création d’un routeur Express pour gérer les routes des ingrédients
const router = express.Router();
// Import de la fonction query pour interagir avec la base de données
const { query } = require('../config/database');

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: API pour gérer les ingrédients
 */

/**
 * @swagger
 * /ingredients:
 *   get:
 *     summary: Récupérer tous les ingrédients
 *     tags: [Ingredients]
 *     responses:
 *       200:
 *         description: Liste de tous les ingrédients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
// Route GET pour récupérer tous les ingrédients
router.get('/', async (req, res) => {
    // Requête SQL pour récupérer l'id et le nom de tous les ingrédients
    const sql = 'SELECT idingredients AS id, name FROM ingredients ORDER BY idingredients;';
    try {
        // Exécution de la requête SQL
        const [rows] = await query(sql);
        // Retourner le résultat sous forme JSON avec un statut 200
        res.status(200).json(rows);
    } catch (err) {
        // En cas d’erreur, log de l’erreur et retour d’un message 500
        console.error('Erreur récupération ingrédients:', err);
        res.status(500).json({ message: "Impossible de récupérer les ingrédients." });
    }
});

/**
 * @swagger
 * /ingredients:
 *   post:
 *     summary: Créer un nouvel ingrédient
 *     tags: [Ingredients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ingrédient créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 */
// Route POST pour créer un nouvel ingrédient
router.post('/', async (req, res) => {
    // Récupération du nom de l’ingrédient depuis le corps de la requête
    const { name } = req.body;
    // Vérification que le champ 'name' est présent
    if (!name) return res.status(400).json({ message: "Le champ 'name' est requis." });
    try {
        // Insertion de l’ingrédient dans la base de données
        const sql = 'INSERT INTO ingredients (name) VALUES (?)';
        const [result] = await query(sql, [name]);
        // Récupération de l’ID généré pour l’ingrédient
        const newId = result.insertId;
        // Récupération de l’ingrédient créé pour le retourner
        const [rows] = await query('SELECT idingredients AS id, name FROM ingredients WHERE idingredients = ?', [newId]);
        // Retour de l’ingrédient avec un statut 201
        res.status(201).json(rows[0]);
    } catch (err) {
        // En cas d’erreur, log et retour message 500
        console.error('Erreur création ingrédient:', err);
        res.status(500).json({ message: "Impossible de créer l'ingrédient." });
    }
});

/**
 * @swagger
 * /ingredients/{id}:
 *   get:
 *     summary: Récupérer un ingrédient par ID
 *     tags: [Ingredients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'ingrédient
 *     responses:
 *       200:
 *         description: Ingrédient trouvé
 *       404:
 *         description: Ingrédient non trouvé
 */
// Route GET pour récupérer un ingrédient par ID
router.get('/:id', async (req, res) => {
    // Conversion de l’ID en entier
    const id = parseInt(req.params.id, 10);
    // Vérification que l’ID est valide
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });
    try {
        // Requête SQL pour récupérer l’ingrédient correspondant à l’ID
        const sql = 'SELECT idingredients AS id, name FROM ingredients WHERE idingredients = ?;';
        const [rows] = await query(sql, [id]);
        // Si aucun résultat, retourner 404
        if (rows.length === 0) return res.status(404).json({ message: "Ingrédient non trouvé." });
        // Retourner l’ingrédient trouvé avec statut 200
        res.status(200).json(rows[0]);
    } catch (err) {
        // En cas d’erreur, log et retour message 500
        console.error(`Erreur récupération ingrédient ID ${id}:`, err);
        res.status(500).json({ message: "Impossible de récupérer l'ingrédient." });
    }
});

/**
 * @swagger
 * /ingredients/{id}:
 *   put:
 *     summary: Mettre à jour un ingrédient existant
 *     tags: [Ingredients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'ingrédient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ingrédient mis à jour
 *       404:
 *         description: Ingrédient non trouvé
 */
// Route PUT pour mettre à jour un ingrédient par ID
router.put('/:id', async (req, res) => {
    // Conversion de l’ID en entier
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });
    try {
        // Vérifier si l’ingrédient existe
        const [existing] = await query('SELECT * FROM ingredients WHERE idingredients = ?', [id]);
        if (!existing.length) return res.status(404).json({ message: "Ingrédient non trouvé." });
        // Déterminer le nouveau nom (ou garder l’ancien si non fourni)
        const updatedName = name || existing[0].name;
        // Mettre à jour l’ingrédient dans la base
        await query('UPDATE ingredients SET name = ? WHERE idingredients = ?', [updatedName, id]);
        // Récupérer et retourner l’ingrédient mis à jour
        const [rows] = await query('SELECT idingredients AS id, name FROM ingredients WHERE idingredients = ?', [id]);
        res.status(200).json(rows[0]);
    } catch (err) {
        // En cas d’erreur, log et retour message 500
        console.error(`Erreur mise à jour ingrédient ID ${id}:`, err);
        res.status(500).json({ message: "Impossible de mettre à jour l'ingrédient." });
    }
});

/**
 * @swagger
 * /ingredients/{id}:
 *   delete:
 *     summary: Supprimer un ingrédient
 *     tags: [Ingredients]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'ingrédient
 *     responses:
 *       204:
 *         description: Ingrédient supprimé
 *       404:
 *         description: Ingrédient non trouvé
 */
// Route DELETE pour supprimer un ingrédient par ID
router.delete('/:id', async (req, res) => {
    // Conversion de l’ID en entier
    const id = parseInt(req.params.id, 10);
    // Suppression de l’ingrédient dans la base
    const [result] = await query('DELETE FROM ingredients WHERE idingredients = ?', [id]);
    // Si aucun ingrédient supprimé, retourner 404
    if (result.affectedRows === 0) return res.status(404).json({ message: "Ingrédient non trouvé." });
    // Retourner un statut 204 (pas de contenu) pour indiquer la suppression
    res.status(204).send();
});

// Export du routeur pour l’utiliser dans app.js
module.exports = router;
