-- 1. Insert Pizzas
INSERT INTO pizzas (name, price) VALUES
('Margherita', 12),
('Pepperoni', 15),
('Hawaiian', 14),
('Veggie Supreme', 16),
('BBQ Chicken', 17);

-- 2. Insert Ingredients
INSERT INTO ingredients (name) VALUES
('Tomato Sauce'),
('Mozzarella Cheese'),
('Basil'),
('Pepperoni'),
('Ham'),
('Pineapple'),
('Mushrooms'),
('Onions'),
('Green Peppers'),
('Black Olives'),
('Chicken'),
('BBQ Sauce');

-- 3. Insert Relation Data (pizzas_has_ingredients)

-- Margherita (1)
INSERT INTO pizzas_has_ingredients (pizzas_idpizzas, ingredients_idingredients) VALUES
(1, (SELECT idingredients FROM ingredients WHERE name = 'Tomato Sauce')),
(1, (SELECT idingredients FROM ingredients WHERE name = 'Mozzarella Cheese')),
(1, (SELECT idingredients FROM ingredients WHERE name = 'Basil'));

-- Pepperoni (2)
INSERT INTO pizzas_has_ingredients (pizzas_idpizzas, ingredients_idingredients) VALUES
(2, (SELECT idingredients FROM ingredients WHERE name = 'Tomato Sauce')),
(2, (SELECT idingredients FROM ingredients WHERE name = 'Mozzarella Cheese')),
(2, (SELECT idingredients FROM ingredients WHERE name = 'Pepperoni'));

-- Hawaiian (3)
INSERT INTO pizzas_has_ingredients (pizzas_idpizzas, ingredients_idingredients) VALUES
(3, (SELECT idingredients FROM ingredients WHERE name = 'Tomato Sauce')),
(3, (SELECT idingredients FROM ingredients WHERE name = 'Mozzarella Cheese')),
(3, (SELECT idingredients FROM ingredients WHERE name = 'Ham')),
(3, (SELECT idingredients FROM ingredients WHERE name = 'Pineapple'));

-- Veggie Supreme (4)
INSERT INTO pizzas_has_ingredients (pizzas_idpizzas, ingredients_idingredients) VALUES
(4, (SELECT idingredients FROM ingredients WHERE name = 'Tomato Sauce')),
(4, (SELECT idingredients FROM ingredients WHERE name = 'Mozzarella Cheese')),
(4, (SELECT idingredients FROM ingredients WHERE name = 'Mushrooms')),
(4, (SELECT idingredients FROM ingredients WHERE name = 'Onions')),
(4, (SELECT idingredients FROM ingredients WHERE name = 'Green Peppers')),
(4, (SELECT idingredients FROM ingredients WHERE name = 'Black Olives'));

-- BBQ Chicken (5)
INSERT INTO pizzas_has_ingredients (pizzas_idpizzas, ingredients_idingredients) VALUES
(5, (SELECT idingredients FROM ingredients WHERE name = 'BBQ Sauce')),
(5, (SELECT idingredients FROM ingredients WHERE name = 'Mozzarella Cheese')),
(5, (SELECT idingredients FROM ingredients WHERE name = 'Chicken')),
(5, (SELECT idingredients FROM ingredients WHERE name = 'Onions'));