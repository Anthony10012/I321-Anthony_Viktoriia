
// Import du module express pour créer l’application serveur
var express = require('express');
const setupSwagger = require("./routes/swagger");
var path = require('path');

// Import du middleware cookie-parser pour lire les cookies

// Import du module express pour créer l'application serveur
var express = require('express');

// Import de la fonction setupSwagger depuis le fichier swagger.js
const setupSwagger = require("./routes/swagger");

// Import du module path pour gérer les chemins de fichiers
var path = require('path');

// Import du middleware cookie-parser pour lire les cookies dans les requêtes
var cookieParser = require('cookie-parser');

// Import du middleware morgan pour logger les requêtes HTTP dans la console. 
var logger = require('morgan');


// Import du routeur principal (index)
var indexRouter = require('./routes/index');
var pizzasRouter = require('./routes/pizzas');
var ingredientsRouter = require('./routes/ingredients');

// Création de l’application Express

// Import du routeur principal (index.js)
var indexRouter = require('./routes/index');

// Import du routeur pour gérer les routes pizzas
var pizzasRouter = require('./routes/pizzas');

// Import du routeur pour gérer les routes ingredients
var ingredientsRouter = require('./routes/ingredients');

// Création de l'application Express
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/pizzas', pizzasRouter);
app.use('/ingredients', ingredientsRouter);

setupSwagger(app);

// Export de l’application pour pouvoir la démarrer depuis le fichier bin/www ou autre


// Utilisation du routeur ingredients pour toutes les routes commençant par "/ingredients"
app.use('/ingredients', ingredientsRouter);

// Configuration de Swagger pour la documentation de l'API
setupSwagger(app);

// Export de l'application pour pouvoir la démarrer depuis bin/www ou autre
module.exports = app;
