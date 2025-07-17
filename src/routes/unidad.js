const express = require('express');
const router = express.Router();
const unidadController = require('../controllers/unidadController');
const verifyToken = require('../middleware/verifyToken');

// Listar todas las unidades (público autenticado)
router.get('/', verifyToken, unidadController.listarUnidades);

// Crear nueva unidad (solo admin/supervisor)
router.post('/', verifyToken, unidadController.crearUnidad);

// Actualizar unidad (solo admin/supervisor)
router.put('/:id', verifyToken, unidadController.actualizarUnidad);

// Eliminar unidad (solo admin/supervisor)
router.delete('/:id', verifyToken, unidadController.eliminarUnidad);

module.exports = router;
