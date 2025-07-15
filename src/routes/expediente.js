const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');
const verifyToken = require('../middleware/verifyToken');

// Crear expediente (y opcionalmente su primer movimiento)
router.post('/', verifyToken, expedienteController.crearExpediente);

// Este es el endpoint para obtener un expediente por su id
router.get('/:id', verifyToken, expedienteController.obtenerExpediente);

// Crear movimiento para un expediente existente
router.post('/:expedienteId/movimientos', verifyToken, expedienteController.crearMovimiento);

module.exports = router;
