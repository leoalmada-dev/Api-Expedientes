const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const verifyToken = require('../middleware/verifyToken');

// Actualizar movimiento
router.put('/:id', verifyToken, movimientoController.actualizarMovimiento);

// Eliminar movimiento
router.delete('/:id', verifyToken, movimientoController.eliminarMovimiento);

// Crear un nuevo movimiento para un expediente
router.post('/:expedienteId', verifyToken, movimientoController.crearMovimiento);

// Obtener el historial completo de movimientos de un expediente
router.get('/:expedienteId/historial', verifyToken, movimientoController.historialExpediente);

module.exports = router;
