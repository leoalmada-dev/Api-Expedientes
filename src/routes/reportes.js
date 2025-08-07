const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const verifyToken = require('../middleware/verifyToken');

// Usuarios (solo admin/supervisor)
router.get("/usuarios", verifyToken, reportesController.reporteUsuarios);

// Expedientes (admin, supervisor, operador)
router.get("/expedientes", verifyToken, reportesController.reporteExpedientes);

module.exports = router;
