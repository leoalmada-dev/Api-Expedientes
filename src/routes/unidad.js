const express = require('express');
const router = express.Router();
const unidadController = require('../controllers/unidadController');
const verifyToken = require('../middleware/verifyToken');
const { validarUnidad, chequearErrores } = require('../validations/unidadValidator');

router.get('/', verifyToken, unidadController.listarUnidades);

// Crear unidad
router.post('/', verifyToken, validarUnidad, chequearErrores, unidadController.crearUnidad);

// Actualizar unidad
router.put('/:id', verifyToken, validarUnidad, chequearErrores, unidadController.actualizarUnidad);

router.delete('/:id', verifyToken, unidadController.eliminarUnidad);

module.exports = router;
