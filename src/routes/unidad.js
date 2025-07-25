const express = require('express');
const router = express.Router();
const unidadController = require('../controllers/unidadController');
const verifyToken = require('../middleware/verifyToken');
const { validarUnidad, chequearErrores } = require('../validations/unidadValidator');

/**
 * @swagger
 * tags:
 *   name: Unidades
 *   description: Gestión de unidades internas y externas
 */

/**
 * @swagger
 * /unidades:
 *   get:
 *     summary: Listar unidades
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de unidades
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
 *                     $ref: '#/components/schemas/Unidad'
 */

/**
 * @swagger
 * /unidades:
 *   post:
 *     summary: Crear una unidad
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnidadInput'
 *     responses:
 *       201:
 *         description: Unidad creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadResponse'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 */

/**
 * @swagger
 * /unidades/{id}:
 *   put:
 *     summary: Actualizar unidad
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la unidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnidadInput'
 *     responses:
 *       200:
 *         description: Unidad actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadResponse'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: No encontrada
 */

/**
 * @swagger
 * /unidades/{id}:
 *   delete:
 *     summary: Eliminar unidad
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la unidad
 *     responses:
 *       200:
 *         description: Unidad eliminada correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: No encontrada
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Unidad:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *           example: Jefatura de Policía
 *         tipo:
 *           type: string
 *           enum: [interno, externo]
 *           example: interno
 *     UnidadInput:
 *       type: object
 *       required:
 *         - nombre
 *         - tipo
 *       properties:
 *         nombre:
 *           type: string
 *           example: Jefatura de Policía
 *         tipo:
 *           type: string
 *           enum: [interno, externo]
 *           example: externo
 *     UnidadResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Unidad'
 */

router.get('/', verifyToken, unidadController.listarUnidades);

// Crear unidad
router.post('/', verifyToken, validarUnidad, chequearErrores, unidadController.crearUnidad);

// Actualizar unidad
router.put('/:id', verifyToken, validarUnidad, chequearErrores, unidadController.actualizarUnidad);

router.delete('/:id', verifyToken, unidadController.eliminarUnidad);

module.exports = router;
