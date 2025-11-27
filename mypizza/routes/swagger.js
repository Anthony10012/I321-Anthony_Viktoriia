const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MyPizza API",
      version: "1.0.0",
      description: "API for pizzas and ingredients",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
