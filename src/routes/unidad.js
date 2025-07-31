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
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


router.get('/', verifyToken, unidadController.listarUnidades);

// Crear unidad
router.post('/', verifyToken, validarUnidad, chequearErrores, unidadController.crearUnidad);

// Actualizar unidad
router.put('/:id', verifyToken, validarUnidad, chequearErrores, unidadController.actualizarUnidad);

router.delete('/:id', verifyToken, unidadController.eliminarUnidad);

module.exports = router;
