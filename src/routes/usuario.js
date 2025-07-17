const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verifyToken = require('../middleware/verifyToken');
const { validarCrearUsuario, chequearErrores } = require('../validations/usuarioValidator');

router.get('/', verifyToken, usuarioController.listarUsuarios);

router.post('/', verifyToken, validarCrearUsuario, chequearErrores, usuarioController.crearUsuario);

router.put('/:id', verifyToken, usuarioController.actualizarUsuario);

router.delete('/:id', verifyToken, usuarioController.eliminarUsuario);

module.exports = router;
