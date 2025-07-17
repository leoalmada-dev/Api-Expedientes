const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verifyToken = require('../middleware/verifyToken');

// Listar usuarios (solo admin/supervisor)
router.get('/', verifyToken, usuarioController.listarUsuarios);

// Crear usuario (solo admin/supervisor)
router.post('/', verifyToken, usuarioController.crearUsuario);

// Actualizar usuario (solo admin/supervisor)
router.put('/:id', verifyToken, usuarioController.actualizarUsuario);

// Eliminar usuario (solo admin/supervisor)
router.delete('/:id', verifyToken, usuarioController.eliminarUsuario);

module.exports = router;
