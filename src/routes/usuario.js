const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verifyToken = require('../middleware/verifyToken');
const { validarCrearUsuario, chequearErrores } = require('../validations/usuarioValidator');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *       403:
 *         description: No autorizado
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un usuario nuevo
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Conflicto (CI ya registrado)
 */

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario existente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *           example: Leonardo Almada
 *         ci:
 *           type: string
 *           example: "12345678"
 *         correo:
 *           type: string
 *           example: leoalmada@correo.com
 *         rolId:
 *           type: integer
 *           example: 1
 *         unidadId:
 *           type: integer
 *           example: 2
 *         Rol:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *         Unidad:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *     UsuarioInput:
 *       type: object
 *       required:
 *         - nombre
 *         - ci
 *         - correo
 *         - contraseña
 *         - rolId
 *         - unidadId
 *       properties:
 *         nombre:
 *           type: string
 *           example: Leonardo Almada
 *         ci:
 *           type: string
 *           example: "12345678"
 *         correo:
 *           type: string
 *           example: leoalmada@correo.com
 *         contraseña:
 *           type: string
 *           example: usuario123
 *         rolId:
 *           type: integer
 *           example: 1
 *         unidadId:
 *           type: integer
 *           example: 2
 *     UsuarioResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Usuario'
 */

router.get('/', verifyToken, usuarioController.listarUsuarios);

router.post('/', verifyToken, validarCrearUsuario, chequearErrores, usuarioController.crearUsuario);

router.put('/:id', verifyToken, usuarioController.actualizarUsuario);

router.delete('/:id', verifyToken, usuarioController.eliminarUsuario);

module.exports = router;
