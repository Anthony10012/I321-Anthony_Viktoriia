// Import du module express pour créer le serveur et les routes
const express = require('express');

// Création d’un routeur express pour gérer les routes de pizzas
const router = express.Router();

// Import de la fonction query et du pool depuis la configuration de la base de données
const { query, pool } = require('../config/database');

// ---------------- GET ALL PIZZAS ----------------
// Route pour récupérer toutes les pizzas
router.get('/', async (req, res) => {
    try {
        // Requête SQL simple pour récupérer id, nom (title) et prix de toutes les pizzas
        const sql = 'SELECT idpizzas AS id, name AS title, price FROM pizzas ORDER BY idpizzas;';
        
        // Exécution de la requête SQL
        const [rows] = await query(sql);
        
        // Retour des données en JSON avec un statut 200 (OK)
        res.status(200).json(rows);
    } catch (err) {
        // En cas d’erreur, log de l’erreur et renvoi d’un message 500 (erreur serveur)
        console.error('Erreur récupération pizzas:', err);
        res.status(500).json({ message: "Impossible de récupérer les pizzas." });
    }
});

// ---------------- GET PIZZA BY ID ----------------
// Route pour récupérer une pizza spécifique par son ID
router.get('/:id', async (req, res) => {
    // Conversion de l’ID en nombre entier
    const id = parseInt(req.params.id, 10);
    
    // Vérification que l’ID est valide
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

    try {
        // Requête SQL pour récupérer la pizza correspondant à l’ID
        const sql = 'SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?;';
        const [rows] = await query(sql, [id]);

        // Si aucune pizza trouvée, retour 404
        if (rows.length === 0) return res.status(404).json({ message: "Pizza non trouvée." });

        // Retour de la pizza trouvée en JSON
        res.status(200).json(rows[0]);
    } catch (err) {
        // En cas d’erreur serveur, log et retour d’un message 500
        console.error(`Erreur récupération pizza ID ${id}:`, err);
        res.status(500).json({ message: "Impossible de récupérer la pizza." });
    }
});

// ---------------- CREATE PIZZA ----------------
// Route pour créer une nouvelle pizza
router.post('/', async (req, res) => {
    // Récupération des données envoyées dans le corps de la requête
    const { title, price } = req.body;

    // Vérification que les champs obligatoires sont présents
    if (!title || !price) {
        return res.status(400).json({ message: "Champs requis manquants: title, price." });
    }

    try {
        // Requête SQL pour insérer la nouvelle pizza dans la base
        const sql = 'INSERT INTO pizzas (name, price) VALUES (?, ?)';
        const [result] = await query(sql, [title, price]);

        // Récupération de l’ID de la pizza créée
        const newId = result.insertId;

        // Requête pour récupérer la pizza créée afin de la retourner au client
        const [rows] = await query('SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?', [newId]);

        // Retour de la pizza créée avec statut 201 (créé)
        res.status(201).json(rows[0]);
    } catch (err) {
        // Log de l’erreur et retour message 500 si problème serveur
        console.error('Erreur création pizza:', err);
        res.status(500).json({ message: "Impossible de créer la pizza." });
    }
});

// ---------------- UPDATE PIZZA ----------------
// Route pour mettre à jour une pizza existante par ID
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, price } = req.body;

    // Vérification que l’ID est un nombre valide
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

    try {
        // Vérification que la pizza existe dans la base
        const [existing] = await query('SELECT * FROM pizzas WHERE idpizzas = ?', [id]);
        if (!existing.length) return res.status(404).json({ message: "Pizza non trouvée." });

        // Détermination des nouvelles valeurs, sinon on garde celles existantes
        const updatedTitle = title || existing[0].name;
        const updatedPrice = price || existing[0].price;

        // Mise à jour de la pizza dans la base
        await query('UPDATE pizzas SET name = ?, price = ? WHERE idpizzas = ?', [updatedTitle, updatedPrice, id]);

        // Récupération de la pizza mise à jour pour la renvoyer au client
        const [rows] = await query('SELECT idpizzas AS id, name AS title, price FROM pizzas WHERE idpizzas = ?', [id]);
        res.status(200).json(rows[0]);
    } catch (err) {
        // Log et retour message 500 en cas de problème serveur
        console.error(`Erreur mise à jour pizza ID ${id}:`, err);
        res.status(500).json({ message: "Impossible de mettre à jour la pizza." });
    }
});

// ---------------- DELETE PIZZA ----------------
// Route pour supprimer une pizza par ID
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    // Vérification que l’ID est valide
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

    try {
        // Suppression de la pizza dans la base
        const [result] = await query('DELETE FROM pizzas WHERE idpizzas = ?', [id]);

        // Si aucune pizza supprimée, on retourne 404
        if (result.affectedRows === 0) return res.status(404).json({ message: "Pizza non trouvée." });

        // Retour 204 (pas de contenu) pour confirmer la suppression
        res.status(204).send();
    } catch (err) {
        // Log et retour message 500 si erreur serveur
        console.error(`Erreur suppression pizza ID ${id}:`, err);
        res.status(500).json({ message: "Impossible de supprimer la pizza." });
    }
});

// Export du routeur pour l’utiliser dans app.js
module.exports = router;
