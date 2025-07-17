const { body, validationResult } = require('express-validator');

exports.validarLogin = [
  body('usuario')
    .notEmpty().withMessage('El usuario (CI) es obligatorio')
    .isLength({ min: 8, max: 8 }).withMessage('El usuario (CI) debe tener 8 dígitos')
    .isNumeric().withMessage('El usuario (CI) debe ser numérico'),
  body('contraseña')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
];

exports.chequearErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos inválidos para login',
      errores: errors.array(),
    });
  }
  next();
};
