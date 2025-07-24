const { body, validationResult } = require('express-validator');

// Validaciones para crear movimiento
exports.validarCrearMovimiento = [
  body('tipo')
    .notEmpty().withMessage('El tipo de movimiento es obligatorio')
    .isIn(['entrada', 'salida']).withMessage('Tipo de movimiento inválido'),

  body('fecha_movimiento')
    .notEmpty().withMessage('La fecha de movimiento es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (usar YYYY-MM-DD)'),

  body('unidadDestinoId')
    .notEmpty().withMessage('Debe indicar la unidad de destino')
    .isInt({ min: 1 }).withMessage('Unidad de destino inválida'),

  body('unidadOrigenId')
    .optional()
    .isInt({ min: 1 }).withMessage('Unidad de origen inválida'),

  body('observaciones')
    .optional()
    .isLength({ max: 250 }).withMessage('Las observaciones deben tener hasta 250 caracteres'),
];

// Validaciones para actualizar movimiento (todos opcionales)
exports.validarActualizarMovimiento = [
  body('tipo')
    .optional()
    .isIn(['entrada', 'salida']).withMessage('Tipo de movimiento inválido'),

  body('fecha_movimiento')
    .optional()
    .isISO8601().withMessage('Formato de fecha inválido (usar YYYY-MM-DD)'),

  body('unidadDestinoId')
    .optional()
    .isInt({ min: 1 }).withMessage('Unidad de destino inválida'),

  body('unidadOrigenId')
    .optional()
    .isInt({ min: 1 }).withMessage('Unidad de origen inválida'),

  body('observaciones')
    .optional()
    .isLength({ max: 250 }).withMessage('Las observaciones deben tener hasta 250 caracteres'),
];

// Middleware único para chequear errores
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
