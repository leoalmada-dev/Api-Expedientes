const { LoginIntento } = require("../models");

async function registrarLoginIntento({ usuario, exito, motivo, ip }) {
  try {
    await LoginIntento.create({ usuario, exito, motivo, ip });
  } catch (err) {
    console.error("No se pudo registrar intento de login:", err);
  }
}

module.exports = registrarLoginIntento;
