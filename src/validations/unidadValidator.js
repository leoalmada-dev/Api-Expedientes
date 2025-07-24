const { body, validationResult } = require('express-validator');

// Validaciones para crear o actualizar unidad
exports.validarUnidad = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la unidad es obligatorio')
    .isLength({ min: 2, max: 80 })
    .withMessage('El nombre debe tener entre 2 y 80 caracteres'),

  // Nuevo: Validación para tipo
  body('tipo')
    .optional()
    .isIn(['interno', 'externo'])
    .withMessage('El tipo debe ser "interno" o "externo"'),
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
