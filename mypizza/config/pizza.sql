DROP SCHEMA IF EXISTS `pizzayo`;

CREATE SCHEMA IF NOT EXISTS `pizzayo` DEFAULT CHARACTER SET utf8mb4;

USE `pizzayo`;

CREATE TABLE IF NOT EXISTS pizzas (
    idpizzas INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    price INT NOT NULL,
    CONSTRAINT nom_UNIQUE UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS ingredients (
    idingredients INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    CONSTRAINT name_UNIQUE UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS pizzas_has_ingredients (
    pizzas_idpizzas INT NOT NULL,
    ingredients_idingredients INT NOT NULL,

    PRIMARY KEY (pizzas_idpizzas, ingredients_idingredients),

    CONSTRAINT fk_pizzas_has_ingredients_pizzas
        FOREIGN KEY (pizzas_idpizzas)
        REFERENCES pizzas(idpizzas)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_pizzas_has_ingredients_ingredients
        FOREIGN KEY (ingredients_idingredients)
        REFERENCES ingredients(idingredients)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX fk_pizzas_has_ingredients_pizzas_idx
    ON pizzas_has_ingredients (pizzas_idpizzas);

CREATE INDEX fk_pizzas_has_ingredients_ingredients_idx
    ON pizzas_has_ingredients (ingredients_idingredients);
