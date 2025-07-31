const helmet = require('helmet');
const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
require("dotenv").config();

// ------ rate limiting ------
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // máximo 5 intentos
  message: {
    ok: false,
    mensaje: "Demasiados intentos de inicio de sesión, intente más tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por IP por minuto
  message: { ok: false, mensaje: "Demasiadas peticiones, intente luego." },
});
// ------ /rate limiting ------

// ------ SWAGGER/OpenAPI ------
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ------ /SWAGGER ------

app.use(helmet()); // Seguridad HTTP headers por defecto

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

// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :remote-addr :user-agent'));
app.use(morgan("dev")); //dev o combined

// Limiters rutas
app.use('/auth/login', loginLimiter);
app.use(generalLimiter); // Si lo pones aquí, afecta a todas las rutas

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
