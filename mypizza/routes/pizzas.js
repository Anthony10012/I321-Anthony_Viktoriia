
var express = require('express');
var router = express.Router();

const { query } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [pizzas] = await query('SELECT id, title, image, ingredients, price FROM pizzas'); 
    res.status(200).json(pizzas);
  } catch (error) {
    console.error('Error fetching all pizzas:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des pizzas." });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "ID de pizza invalide." });
  }

  try {

    const [pizzas] = await query('SELECT id, title, image, ingredients, price FROM pizzas WHERE id = ?', [id]);
    
    const pizza = pizzas[0]; 
    
    if (!pizza) {
      return res.status(404).json({ message: "Pizza non trouvée" });
    }
    res.status(200).json(pizza);
  } catch (error) {
    console.error(`Error fetching pizza with id ${id}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération de la pizza." });
  }
});

router.post('/', async (req, res) => {
  const { title, image, ingredients, price } = req.body;

  if (!title || !ingredients || !price) {
    return res.status(400).json({ message: "Champs requis manquants: title, ingredients, price" });
  }

  const ingredientsString = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients; 
  
  try {

    const [result] = await query(
        'INSERT INTO pizzas (title, image, ingredients, price) VALUES (?, ?, ?, ?)', 
        [title, image || null, ingredientsString, price]
    );


    const [newPizzaRows] = await query('SELECT id, title, image, ingredients, price FROM pizzas WHERE id = ?', [result.insertId]);

    res.status(201).json(newPizzaRows[0]);
  } catch (error) {
    console.error('Error creating new pizza:', error);
    res.status(500).json({ message: "Erreur lors de la création de la pizza." });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, image, ingredients, price } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID de pizza invalide." });
  }

  try {
      const [existingPizzas] = await query('SELECT title, image, ingredients, price FROM pizzas WHERE id = ?', [id]);
      const existingPizza = existingPizzas[0];

      if (!existingPizza) {
          return res.status(404).json({ message: "Pizza non trouvée" });
      }


      const updatedTitle = title !== undefined ? title : existingPizza.title;
      const updatedImage = image !== undefined ? image : existingPizza.image;
      const updatedIngredients = ingredients !== undefined 
          ? (Array.isArray(ingredients) ? ingredients.join(', ') : ingredients) 
          : existingPizza.ingredients;
      const updatedPrice = price !== undefined ? price : existingPizza.price;

      const [updateResult] = await query(
          'UPDATE pizzas SET title = ?, image = ?, ingredients = ?, price = ? WHERE id = ?',
          [updatedTitle, updatedImage, updatedIngredients, updatedPrice, id]
      );

      const [updatedPizzaRows] = await query('SELECT id, title, image, ingredients, price FROM pizzas WHERE id = ?', [id]);

      res.status(200).json(updatedPizzaRows[0]);

  } catch (error) {
    console.error(`Error updating pizza with id ${id}:`, error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la pizza." });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID de pizza invalide." });
  }

  try {

    const [result] = await query('DELETE FROM pizzas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pizza non trouvée" });
    }
    
    res.status(204).send(); 
  } catch (error) {
    console.error(`Error deleting pizza with id ${id}:`, error);
    res.status(500).json({ message: "Erreur lors de la suppression de la pizza." });
  }
});


module.exports = router;