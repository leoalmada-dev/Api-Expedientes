// src/config/swagger.js

const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Sistema de Gestión de Expedientes",
    version: "1.0.0",
    description: `API para la gestión integral de expedientes, movimientos, unidades y auditoría. Incluye autenticación JWT y control de roles.  
     
**Usuarios y contraseñas SOLO para desarrollo/testing**:  
| CI        | Contraseña    | Rol         |
|-----------|--------------|--------------|
| 12345678  | admin123     | Admin        |
| 23456789  | supervisor123| Supervisor   |
| 34567890  | operador123  | Operador     |
| 45678901  | visual123    | Visualizador |
`,
    contact: {
      name: "Desarrollador",
      email: "leoalmada.dev@gmail.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

// Puedes agregar otras opciones si lo deseas
const swaggerOptions = {
  swaggerDefinition,
  apis: [
    "./src/routes/*.js",
    // Si tus modelos tienen anotaciones, también inclúyelos:
    // "./src/models/*.js",
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
