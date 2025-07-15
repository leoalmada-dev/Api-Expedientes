const express = require("express");
const app = express();
require("dotenv").config();
const bcrypt = require('bcryptjs');

app.use(express.json());

// Importar rutas principales
app.use("/auth", require("./routes/auth"));
app.use("/expedientes", require("./routes/expediente"));
app.use("/protected", require("./routes/protected"));
app.use("/movimientos", require("./routes/movimiento"));

// Importar todos los modelos desde el index de modelos
const models = require("./models");
const { sequelize, Rol, Unidad, Usuario } = models;

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    // Precargar roles
    await Rol.bulkCreate(
      [
        { nombre: "admin" },
        { nombre: "supervisor" },
        { nombre: "operador" },
        { nombre: "visualizador" },
      ],
      { ignoreDuplicates: true }
    );

    // Precargar unidades
    await Unidad.bulkCreate(
      [
        { nombre: "Secretaría General" },
        { nombre: "Jurídica" },
        { nombre: "Archivo" },
        { nombre: "Externo" },
      ],
      { ignoreDuplicates: true }
    );

    // Precargar usuarios asignando rol y unidades previas
    await models.Usuario.bulkCreate(
      [
        {
          nombre: "Admin",
          correo: "admin@demo.com",
          contraseña: await bcrypt.hash("admin123", 10),
          rolId: 1,
          unidadId: 1,
        },
        {
          nombre: "Supervisora",
          correo: "supervisor@demo.com",
          contraseña: await bcrypt.hash("supervisor123", 10),
          rolId: 2,
          unidadId: 1,
        },
        {
          nombre: "Operador",
          correo: "operador@demo.com",
          contraseña: await bcrypt.hash("operador123", 10),
          rolId: 3,
          unidadId: 1,
        },
        {
          nombre: "Visualizador",
          correo: "visualizador@demo.com",
          contraseña: await bcrypt.hash("visual123", 10),
          rolId: 4,
          unidadId: 1,
        },
      ],
      { ignoreDuplicates: true }
    );

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error sincronizando base de datos:", error);
  });

module.exports = app;
