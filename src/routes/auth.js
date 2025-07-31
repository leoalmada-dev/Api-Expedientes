const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarLogin, chequearErrores } = require('../validations/authValidator');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para login y manejo de sesión de usuarios
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - contraseña
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: "12345678"
 *               contraseña:
 *                 type: string
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Login exitoso"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/login', validarLogin, chequearErrores, authController.login);
// router.post('/register', ...);

module.exports = router;
