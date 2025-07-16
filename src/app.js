const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

// Importar rutas principales
app.use("/auth", require("./routes/auth"));
app.use("/expedientes", require("./routes/expediente"));
app.use("/protected", require("./routes/protected"));
app.use("/movimientos", require("./routes/movimiento"));

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
