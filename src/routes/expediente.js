const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');
const verifyToken = require('../middleware/verifyToken');

const {
  validarCrearExpediente,
  validarActualizarExpediente,
  chequearErrores: chequearErroresExp
} = require('../validations/expedienteValidator');

const {
  validarCrearMovimiento,
  chequearErrores: chequearErroresMov
} = require('../validations/movimientoValidator');

// Listar expedientes
router.get('/', verifyToken, expedienteController.listarExpedientes);

// Crear expediente (y opcionalmente su primer movimiento)
router.post(
  '/',
  verifyToken,
  validarCrearExpediente,
  chequearErroresExp,
  expedienteController.crearExpediente
);

// Obtener expediente por id
router.get('/:id', verifyToken, expedienteController.obtenerExpediente);

// Actualizar expediente (ahora solo valida campos presentes en el body)
router.put(
  '/:id',
  verifyToken,
  validarActualizarExpediente,
  chequearErroresExp,
  expedienteController.actualizarExpediente
);

// Eliminar expediente
router.delete('/:id', verifyToken, expedienteController.eliminarExpediente);

// Cerrar expediente
router.post('/:id/cerrar', verifyToken, expedienteController.cerrarExpediente);

// Reabrir expediente
router.post('/:id/reabrir', verifyToken, expedienteController.reabrirExpediente);

// Crear movimiento para un expediente existente (validación específica de movimientos)
router.post(
  '/:expedienteId/movimientos',
  verifyToken,
  validarCrearMovimiento,
  chequearErroresMov,
  expedienteController.crearMovimiento
);

module.exports = router;
