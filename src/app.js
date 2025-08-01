const helmet = require('helmet');
const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
require("dotenv").config();

// ------ SWAGGER/OpenAPI ------
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ------ /SWAGGER ------

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://10.100.66.32:3000",
      "http://10.100.66.32:5173",
      "http://10.100.66.32",
      "http://localhost:5173",
      "http://10.100.52.221",
      "http://10.100.52.221/SistemaSecGral",
      "http://10.100.52.221:80",
      "http://10.100.52.221:80/SistemaSecGral",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// IMPORTA los nuevos middlewares:
const loginLimiter = require("./middleware/loginLimiter");
const generalLimiter = require("./middleware/generalLimiter");

// Limiters rutas
app.use('/auth/login', loginLimiter);
app.use(generalLimiter);

// Importar rutas principales
app.use("/auth", require("./routes/auth"));
app.use("/expedientes", require("./routes/expediente"));
app.use("/protected", require("./routes/protected"));
app.use("/movimientos", require("./routes/movimiento"));
app.use("/usuarios", require("./routes/usuario"));
app.use("/unidades", require("./routes/unidad"));

// Importar modelos y sincronizar BD
// const models = require("./models");
// const { sequelize } = models;

// sequelize
//   .sync() // { alter: true } , { force: true }
//   .catch((error) => {
//     console.error("Error sincronizando base de datos:", error);
//   });

module.exports = app;
