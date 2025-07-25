const express = require("express");
const cors = require('cors');
const app = express();
const morgan = require('morgan');
require("dotenv").config();

// ------ SWAGGER/OpenAPI ------
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Sistema de Gestión de Expedientes',
    version: '1.0.0',
    description: 'API para la gestión integral de expedientes, movimientos, unidades y auditoría. Incluye autenticación JWT y control de roles.',
    contact: {
      name: 'Desarrollador',
      email: 'leoalmada.dev@gmail.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/models/*.js'], // ajustá si tenés los archivos en otra carpeta
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ------ /SWAGGER ------

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://10.100.66.32:3000",
    "http://10.100.66.32:5173",
    "http://10.100.66.32",
    "http://localhost:5173",
  ],
  credentials: true,
}));

app.use(morgan('dev')); //dev o combined

// Importar rutas principales
app.use("/auth", require("./routes/auth"));
app.use("/expedientes", require("./routes/expediente"));
app.use("/protected", require("./routes/protected"));
app.use("/movimientos", require("./routes/movimiento"));
app.use("/usuarios", require("./routes/usuario"));
app.use("/unidades", require("./routes/unidad"));

// Importar modelos y sincronizar BD
const models = require("./models");
const { sequelize } = models;

sequelize
  .sync() // { alter: true } , { force: true }
  .catch((error) => {
    console.error("Error sincronizando base de datos:", error);
  });

module.exports = app;
