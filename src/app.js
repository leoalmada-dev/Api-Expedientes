const express = require("express");
const cors = require('cors');
const app = express();
const morgan = require('morgan');

require("dotenv").config();

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

app.use(morgan('dev')); // 'dev' es formato compacto | combined}

// Importar rutas principales
app.use("/auth", require("./routes/auth"));
app.use("/expedientes", require("./routes/expediente"));
app.use("/protected", require("./routes/protected"));
app.use("/movimientos", require("./routes/movimiento"));
app.use("/usuarios", require("./routes/usuario"));
app.use("/unidades", require("./routes/unidad"));

// Importar todos los modelos desde el index de modelos
const models = require("./models");
const { sequelize } = models;

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true }) // Cambia a { force: true } si querés limpiar TODO
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error sincronizando base de datos:", error);
  });

module.exports = app;
