const { body, validationResult } = require("express-validator");

// Validaciones para crear o actualizar unidad
exports.validarUnidad = [
  body("nombre")
    .notEmpty()
    .withMessage("El nombre de la unidad es obligatorio")
    .isLength({ min: 2, max: 80 })
    .withMessage("El nombre debe tener entre 2 y 80 caracteres"),

  body("tipo")
    .notEmpty()
    .withMessage("El tipo es obligatorio")
    .isIn(["interno", "externo"])
    .withMessage('El tipo debe ser "interno" o "externo"'),

  body("tipo_institucion")
    .notEmpty()
    .withMessage("El tipo de institución es obligatorio")
    .isString()
    .withMessage("El tipo de institución debe ser texto")
    .isLength({ min: 3, max: 80 })
    .withMessage("El tipo de institución debe tener entre 3 y 80 caracteres"),
];

// Middleware único para chequear errores de express-validator
exports.chequearErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log("📛 Errores de validación:", errors.array()); // 👈 Agregá esto
    return res.status(400).json({
      ok: false,
      mensaje: "Datos inválidos",
      errores: errors.array(),
    });
  }
  next();
};
