const { body, validationResult } = require('express-validator');

// Validaciones para crear usuario
exports.validarCrearUsuario = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('ci')
    .isLength({ min: 8, max: 8 })
    .isNumeric()
    .withMessage('El CI debe tener 8 dígitos numéricos'),
  body('correo').isEmail().withMessage('Correo electrónico inválido'),
  body('contraseña')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rolId').isInt({ min: 1 }).withMessage('Debe elegir un rol válido'),
  body('unidadId').isInt({ min: 1 }).withMessage('Debe elegir una unidad válida'),
];

// Middleware único para chequear errores de express-validator
exports.chequearErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos inválidos',
      errores: errors.array(),
    });
  }
  next();
};
