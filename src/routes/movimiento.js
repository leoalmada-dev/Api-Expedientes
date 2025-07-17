const express = require("express");
const router = express.Router();
const movimientoController = require("../controllers/movimientoController");
const verifyToken = require("../middleware/verifyToken");
const {
  validarCrearMovimiento,
  validarActualizarMovimiento,
  chequearErrores,
} = require("../validations/movimientoValidator");

// Crear movimiento
router.post(
  "/",
  verifyToken,
  validarCrearMovimiento,
  chequearErrores,
  movimientoController.crearMovimiento
);

// Actualizar movimiento
router.put(
  "/:id",
  verifyToken,
  validarActualizarMovimiento,
  chequearErrores,
  movimientoController.actualizarMovimiento
);

// Eliminar movimiento
router.delete("/:id", verifyToken, movimientoController.eliminarMovimiento);

// Historial de expediente
router.get(
  "/:expedienteId/historial",
  verifyToken,
  movimientoController.historialExpediente
);

module.exports = router;
