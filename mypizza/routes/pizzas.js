var express = require('express');
var router = express.Router();

let pizzas = [
  {
    id: 1,
    title: "Margherita",
    image: null,
    ingredients: ["Tomato", "Mozzarella", "Basil"],
    price: 8.5
  }
];

router.get('/', (req, res) => {
  res.status(200).json(pizzas);
});

router.get('/:id', (req, res) => {
  const pizza = pizzas.find(p => p.id === Number(req.params.id));
  if (!pizza) {
    return res.status(404).json({ message: "Pizza not found" });
  }
  res.status(200).json(pizza);
});

router.post('/', (req, res) => {
  const { title, image, ingredients, price } = req.body;

  if (!title || !ingredients || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newPizza = {
    id: pizzas.length ? pizzas[pizzas.length - 1].id + 1 : 1,
    title,
    image: image || null,
    ingredients,
    price
  };

  pizzas.push(newPizza);
  res.status(201).json(newPizza);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const pizzaIndex = pizzas.findIndex(p => p.id === id);

  if (pizzaIndex === -1) {
    return res.status(404).json({ message: "Pizza not found" });
  }

  const updatedPizza = {
    ...pizzas[pizzaIndex],
    ...req.body
  };

  pizzas[pizzaIndex] = updatedPizza;
  res.status(200).json(updatedPizza);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const pizzaIndex = pizzas.findIndex(p => p.id === id);

  if (pizzaIndex === -1) {
    return res.status(404).json({ message: "Pizza not found" });
  }

  pizzas.splice(pizzaIndex, 1);
  res.status(204).send();
});

module.exports = router;
