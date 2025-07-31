// src/middleware/loginLimiter.js
const rateLimit = require("express-rate-limit");
const registrarLoginIntento = require("../helpers/registrarLoginIntento");

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5,
  handler: async (req, res, next) => {
    // Registrar intento bloqueado (usuario o IP)
    await registrarLoginIntento({
      usuario: req.body.usuario || null,
      exito: false,
      motivo: "Demasiados intentos de inicio de sesión (bloqueo temporal)",
      ip: req.ip,
    });
    return res.status(429).json({
      ok: false,
      mensaje: "Demasiados intentos de inicio de sesión, intente más tarde.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
