// src/middleware/generalLimiter.js
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { ok: false, mensaje: "Demasiadas peticiones, intente luego." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = generalLimiter;
