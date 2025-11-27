const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// ---------------- GET ALL INGREDIENTS ----------------
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT idingredients AS id, name FROM ingredients ORDER BY idingredients;';
        const [rows] = await query(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erreur récupération ingrédients:', err);
        res.status(500).json({ message: "Impossible de récupérer les ingrédients." });
    }
});


// ---------------- GET INGREDIENT BY ID ----------------
// Route pour récupérer un ingredient spécifique par son ID
router.get('/:id', async (req, res) => {
    // Conversion de l’ID en nombre entier
    const id = parseInt(req.params.id, 10);
    
    // Vérification que l’ID est valide
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

    try {
        // Requête SQL pour récupérer la pizza correspondant à l’ID
        const sql = 'SELECT idingredients AS id, name AS title FROM ingredients WHERE idingredients = ?;';
        const [rows] = await query(sql, [id]);

        // Si aucun ingredient trouvée, retour 404
        if (rows.length === 0) return res.status(404).json({ message: "Ingredient non trouvée." });

        // Retour de l'ingredinet trouvée en JSON
        res.status(200).json(rows[0]);
    } catch (err) {
        // En cas d’erreur serveur, log et retour d’un message 500
        console.error(`Erreur récupération ingredient ID ${id}:`, err);
        res.status(500).json({ message: "Impossible de récupérer l'ingredient." });
    }
});
module.exports = router;
