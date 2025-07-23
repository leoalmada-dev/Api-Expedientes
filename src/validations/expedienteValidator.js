const { body, validationResult } = require('express-validator');

// Validaciones para crear expediente (todos obligatorios)
exports.validarCrearExpediente = [
  body('tipo_documento')
    .notEmpty().withMessage('El tipo de documento es obligatorio')
    .isIn(['oficio', 'apia', 'memo', 'fisico'])
    .withMessage('Tipo de documento inválido'),
  body('numero_documento')
    .notEmpty().withMessage('El número de documento es obligatorio')
    .isLength({ min: 3, max: 30 }).withMessage('El número debe tener entre 3 y 30 caracteres'),
  body('forma_ingreso')
    .notEmpty().withMessage('La forma de ingreso es obligatoria')
    .isIn(['correo', 'apia', 'papel'])
    .withMessage('Forma de ingreso inválida'),
  body('fecha_ingreso')
    .notEmpty().withMessage('La fecha de ingreso es obligatoria')
    .isISO8601().withMessage('Formato de fecha inválido (usar YYYY-MM-DD)'),
  body('referencia')
    .optional()
    .isLength({ max: 32 })
    .withMessage('La referencia debe tener hasta 32 caracteres'),
  body('detalle')
    .optional()
    .isLength({ max: 255 })
    .withMessage('El detalle debe tener hasta 255 caracteres'),
];

// Validaciones para actualizar expediente (todos opcionales)
exports.validarActualizarExpediente = [
  body('tipo_documento')
    .optional()
    .isIn(['oficio', 'apia', 'memo', 'fisico'])
    .withMessage('Tipo de documento inválido'),
  body('numero_documento')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('El número debe tener entre 3 y 30 caracteres'),
  body('forma_ingreso')
    .optional()
    .isIn(['correo', 'apia', 'papel'])
    .withMessage('Forma de ingreso inválida'),
  body('fecha_ingreso')
    .optional()
    .isISO8601().withMessage('Formato de fecha inválido (usar YYYY-MM-DD)'),
  body('referencia')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La referencia debe tener hasta 100 caracteres'),
  body('detalle')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El detalle debe tener hasta 500 caracteres'),
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
