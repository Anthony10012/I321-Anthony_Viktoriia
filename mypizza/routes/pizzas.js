// Importer le module express pour créer le serveur et gérer les routes
const express = require('express');

// Créer un routeur express pour gérer les routes spécifiques aux pizzas
const router = express.Router();

// Importer la fonction query depuis la configuration de la base de données pour exécuter des requêtes SQL
const { query } = require('../config/database');

/**
 * @swagger
 * tags:
 *   name: Pizzas
 *   description: API pour gérer les pizzas
 */

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
    // Définir la requête SQL pour sélectionner id, nom et prix de toutes les pizzas
    const sql = 'SELECT idpizzas AS id, name AS title, price FROM pizzas ORDER BY idpizzas;';
    // Exécuter la requête SQL et récupérer les lignes de résultats
    const [rows] = await query(sql);
    // Envoyer la réponse JSON avec la liste des pizzas et le code HTTP 200
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
    // Extraire title et price depuis le corps de la requête
    const { title, price } = req.body;
    // Vérifier que les champs obligatoires sont présents
    if (!title || !price) return res.status(400).json({ message: "Champs requis manquants: title, price." });
    // Définir la requête SQL pour insérer une nouvelle pizza
    const sql = 'INSERT INTO pizzas (name, price) VALUES (?, ?)';
    // Exécuter l'insertion et récupérer le résultat
    const [result] = await query(sql, [title, price]);
    // Récupérer l'ID de la pizza nouvellement créée
    const newId = result.insertId;
    // Requête pour récupérer la pizza créée afin de l'envoyer dans la réponse
    const [rows] = await query('SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?', [newId]);
    // Envoyer la pizza créée avec le code HTTP 201 (créé)
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
    // Convertir l'ID de la pizza depuis les paramètres de la requête en entier
    const id = parseInt(req.params.id, 10);
    // Requête SQL pour récupérer la pizza correspondant à l'ID
    const sql = 'SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?';
    // Exécuter la requête SQL avec l'ID fourni
    const [rows] = await query(sql, [id]);
    // Si aucune pizza trouvée, renvoyer 404
    if (rows.length === 0) return res.status(404).json({ message: "Pizza non trouvée." });
    // Sinon, renvoyer la pizza trouvée
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
    // Récupérer l'ID depuis les paramètres
    const id = parseInt(req.params.id, 10);
    // Extraire les champs title et price depuis le corps de la requête
    const { title, price } = req.body;
    // Vérifier si la pizza existe
    const [existing] = await query('SELECT * FROM pizzas WHERE idpizzas = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: "Pizza non trouvée." });
    // Déterminer les nouvelles valeurs à mettre à jour (ou garder les anciennes si non fournies)
    const updatedTitle = title || existing[0].name;
    const updatedPrice = price || existing[0].price;
    // Exécuter la requête SQL pour mettre à jour la pizza
    await query('UPDATE pizzas SET name = ?, price = ? WHERE idpizzas = ?', [updatedTitle, updatedPrice, id]);
    // Récupérer la pizza mise à jour pour la renvoyer
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
    // Convertir l'ID depuis les paramètres
    const id = parseInt(req.params.id, 10);
    // Exécuter la suppression dans la base de données
    const [result] = await query('DELETE FROM pizzas WHERE idpizzas = ?', [id]);
    // Si aucune ligne affectée, la pizza n'existait pas → renvoyer 404
    if (result.affectedRows === 0) return res.status(404).json({ message: "Pizza non trouvée." });
    // Sinon, renvoyer 204 (pas de contenu) pour indiquer la suppression
    res.status(204).send();
});

// Exporter le routeur pour l'utiliser dans app.js
module.exports = router;
