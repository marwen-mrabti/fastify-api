export const swaggerOptions = {
  swagger: {
    info: {
      title: "Fastify API",
      description:
        "Building a blazing fast REST API with Node.js, MongoDB, Fastify and Swagger",
      version: "0.1.0",
    },
    host: "localhost",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
      { name: "auth", description: "Authentication related end-points" },
      { name: "users", description: "Users related end-points" },
      { name: "products", description: "Products related end-points" },
    ],
    securityDefinitions: {
      apiKey: {
        type: "apiKey",
        name: "apiKey",
        in: "header",
      },
    },
  },
};
