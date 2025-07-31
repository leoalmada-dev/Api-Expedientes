const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');
const verifyToken = require('../middleware/verifyToken');

const {
  validarCrearExpediente,
  validarActualizarExpediente,
  chequearErrores: chequearErroresExp
} = require('../validations/expedienteValidator');

const {
  validarCrearMovimiento,
  chequearErrores: chequearErroresMov
} = require('../validations/movimientoValidator');
/**
 * @swagger
 * tags:
 *   name: Expedientes
 *   description: Gestión de expedientes y sus movimientos
 */

/**
 * @swagger
 * /expedientes:
 *   get:
 *     summary: Listar expedientes
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo_documento
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de documento (oficio, apia, memo, fisico)
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (YYYY-MM-DD)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [abierto, cerrado]
 *         description: Filtrar por estado del expediente
 *       - in: query
 *         name: eliminados
 *         schema:
 *           type: boolean
 *         description: Solo para supervisor, mostrar eliminados
 *     responses:
 *       200:
 *         description: Lista de expedientes
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
 *                     $ref: '#/components/schemas/Expediente'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /expedientes:
 *   post:
 *     summary: Crear un expediente (puede incluir primer movimiento)
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpedienteInput'
 *     responses:
 *       201:
 *         description: Expediente creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpedienteResponse'
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
 * /expedientes/{id}:
 *   get:
 *     summary: Obtener un expediente por ID
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Datos del expediente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpedienteResponse'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /expedientes/{id}:
 *   put:
 *     summary: Actualizar expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpedienteUpdate'
 *     responses:
 *       200:
 *         description: Expediente actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpedienteResponse'
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
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /expedientes/{id}:
 *   delete:
 *     summary: Eliminar expediente (eliminación lógica)
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente eliminado lógicamente
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
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /expedientes/{id}/cerrar:
 *   post:
 *     summary: Cerrar expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente cerrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo supervisor puede cerrar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /expedientes/{id}/reabrir:
 *   post:
 *     summary: Reabrir expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente reabierto correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo supervisor puede reabrir
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /expedientes/{expedienteId}/movimientos:
 *   post:
 *     summary: Crear movimiento para expediente existente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expedienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimientoInput'
 *     responses:
 *       201:
 *         description: Movimiento creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovimientoResponse'
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
 *         description: Expediente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


// Listar expedientes
router.get('/', verifyToken, expedienteController.listarExpedientes);

// Crear expediente (y opcionalmente su primer movimiento)
router.post(
  '/',
  verifyToken,
  validarCrearExpediente,
  chequearErroresExp,
  expedienteController.crearExpediente
);

// Obtener expediente por id
router.get('/:id', verifyToken, expedienteController.obtenerExpediente);

// Actualizar expediente (ahora solo valida campos presentes en el body)
router.put(
  '/:id',
  verifyToken,
  validarActualizarExpediente,
  chequearErroresExp,
  expedienteController.actualizarExpediente
);

// Eliminar expediente
router.delete('/:id', verifyToken, expedienteController.eliminarExpediente);

// Cerrar expediente
router.post('/:id/cerrar', verifyToken, expedienteController.cerrarExpediente);

// Reabrir expediente
router.post('/:id/reabrir', verifyToken, expedienteController.reabrirExpediente);

// Crear movimiento para un expediente existente (validación específica de movimientos)
router.post(
  '/:expedienteId/movimientos',
  verifyToken,
  validarCrearMovimiento,
  chequearErroresMov,
  expedienteController.crearMovimiento
);

module.exports = router;
