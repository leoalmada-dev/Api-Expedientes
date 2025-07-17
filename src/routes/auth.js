const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarLogin, chequearErrores } = require('../validations/authValidator');

router.post('/login', validarLogin, chequearErrores, authController.login);
// router.post('/register', ...);

module.exports = router;
