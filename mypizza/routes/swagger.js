// Import de swagger-jsdoc pour générer la documentation OpenAPI à partir des annotations dans le code
const swaggerJsdoc = require("swagger-jsdoc");
// Import de swagger-ui-express pour servir une interface graphique de la documentation Swagger
const swaggerUi = require("swagger-ui-express");

// Options de configuration pour swagger-jsdoc
const options = {
  // Définition générale de l'API
  definition: {
    openapi: "3.0.0", // Version d'OpenAPI utilisée
    info: {
      title: "MyPizza API", // Titre de l'API
      version: "1.0.0", // Version de l'API
      description: "API for pizzas and ingredients", // Description de l'API
    },
    // Serveurs où l'API est disponible
    servers: [
      {
        url: "http://localhost:3000", // URL de base pour accéder à l'API
      },
    ],
  },
  // Chemins vers les fichiers contenant les annotations Swagger
  apis: ["./routes/*.js"], // Tous les fichiers JS dans le dossier routes
};

// Génération de la spécification OpenAPI à partir des options ci-dessus
const specs = swaggerJsdoc(options);

// Fonction pour configurer Swagger dans l'application Express
function setupSwagger(app) {
  // Middleware pour servir la documentation Swagger à l'URL /api-docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

// Export de la fonction pour pouvoir l'utiliser dans app.js
module.exports = setupSwagger;
