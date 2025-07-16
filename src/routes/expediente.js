const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');
const verifyToken = require('../middleware/verifyToken');

//listar expedientes
router.get('/', verifyToken, expedienteController.listarExpedientes);

// Crear expediente (y opcionalmente su primer movimiento)
router.post('/', verifyToken, expedienteController.crearExpediente);

// Este es el endpoint para obtener un expediente por su id
router.get('/:id', verifyToken, expedienteController.obtenerExpediente);

// Actualizar expediente
router.put('/:id', verifyToken, expedienteController.actualizarExpediente);

// Eliminar expediente
router.delete('/:id', verifyToken, expedienteController.eliminarExpediente);

// Cerrar expediente
router.post('/:id/cerrar', verifyToken, expedienteController.cerrarExpediente);

// Reabrir expediente
router.post('/:id/reabrir', verifyToken, expedienteController.reabrirExpediente);

// Crear movimiento para un expediente existente
router.post('/:expedienteId/movimientos', verifyToken, expedienteController.crearMovimiento);

module.exports = router;
