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
 *       403:
 *         description: No autorizado
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
 *       404:
 *         description: No encontrado
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
 *       403:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
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
 *       403:
 *         description: No autorizado
 *       404:
 *         description: No encontrado
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
 *       403:
 *         description: Solo supervisor puede cerrar
 *       404:
 *         description: No encontrado
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
 *       403:
 *         description: Solo supervisor puede reabrir
 *       404:
 *         description: No encontrado
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
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Expediente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tipo_documento:
 *           type: string
 *           example: oficio
 *         numero_documento:
 *           type: string
 *         forma_ingreso:
 *           type: string
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *         referencia:
 *           type: string
 *         detalle:
 *           type: string
 *         urgencia:
 *           type: string
 *           enum: [comun, urgente]
 *           example: urgente
 *         estado:
 *           type: string
 *           enum: [abierto, cerrado]
 *         eliminado:
 *           type: boolean
 *         creadoPorId:
 *           type: integer
 *         fecha_cierre:
 *           type: string
 *           format: date-time
 *     ExpedienteInput:
 *       type: object
 *       required:
 *         - tipo_documento
 *         - numero_documento
 *         - forma_ingreso
 *         - fecha_ingreso
 *         - urgencia
 *       properties:
 *         tipo_documento:
 *           type: string
 *           example: oficio
 *         numero_documento:
 *           type: string
 *         forma_ingreso:
 *           type: string
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *         referencia:
 *           type: string
 *         detalle:
 *           type: string
 *         urgencia:
 *           type: string
 *           enum: [comun, urgente]
 *           example: comun
 *         primer_movimiento:
 *           $ref: '#/components/schemas/MovimientoInput'
 *     ExpedienteUpdate:
 *       type: object
 *       properties:
 *         tipo_documento:
 *           type: string
 *         numero_documento:
 *           type: string
 *         forma_ingreso:
 *           type: string
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *         referencia:
 *           type: string
 *         detalle:
 *           type: string
 *         urgencia:
 *           type: string
 *           enum: [comun, urgente]
 *     ExpedienteResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Expediente'
 *     MovimientoInput:
 *       type: object
 *       required:
 *         - tipo
 *         - fecha_movimiento
 *         - unidadDestinoId
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [entrada, salida]
 *           example: entrada
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *         unidadDestinoId:
 *           type: integer
 *         unidadOrigenId:
 *           type: integer
 *         observaciones:
 *           type: string
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
