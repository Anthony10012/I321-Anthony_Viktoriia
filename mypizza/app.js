// Import du module express pour créer l’application serveur
var express = require('express');

// Import du module path pour gérer les chemins de fichiers
var path = require('path');

// Import du middleware cookie-parser pour lire les cookies
var cookieParser = require('cookie-parser');

// Import du middleware morgan pour logger les requêtes HTTP dans la console
var logger = require('morgan');

// Import du routeur principal (index)
var indexRouter = require('./routes/index');

// Import du routeur pour les pizzas
var pizzasRouter = require('./routes/pizzas');

// Création de l’application Express
var app = express();

// Middleware pour afficher les logs des requêtes HTTP en mode développement
app.use(logger('dev'));

// Middleware pour parser le corps des requêtes JSON
app.use(express.json());

// Middleware pour parser le corps des requêtes URL-encoded (formulaires)
app.use(express.urlencoded({ extended: false }));

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware pour servir les fichiers statiques depuis le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Utilisation du routeur principal pour la racine "/"
app.use('/', indexRouter);

// Utilisation du routeur pizzas pour toutes les routes commençant par "/pizzas"
app.use('/pizzas', pizzasRouter);

// Export de l’application pour pouvoir la démarrer depuis le fichier bin/www ou autre
module.exports = app;
