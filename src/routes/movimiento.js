const express = require("express");
const router = express.Router();
const movimientoController = require("../controllers/movimientoController");
const verifyToken = require("../middleware/verifyToken");
const {
  validarCrearMovimiento,
  validarActualizarMovimiento,
  chequearErrores,
} = require("../validations/movimientoValidator");

/**
 * @swagger
 * tags:
 *   name: Movimientos
 *   description: Gestión de movimientos de expedientes
 */

/**
 * @swagger
 * /expedientes/{expedienteId}/movimientos:
 *   post:
 *     summary: Crear movimiento para un expediente existente
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expedienteId
 *         schema:
 *           type: integer
 *         required: true
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
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Expediente no encontrado
 */

/**
 * @swagger
 * /movimientos/{id}:
 *   put:
 *     summary: Actualizar movimiento existente
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del movimiento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimientoInputUpdate'
 *     responses:
 *       200:
 *         description: Movimiento actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovimientoResponse'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Movimiento no encontrado
 */

/**
 * @swagger
 * /movimientos/{id}:
 *   delete:
 *     summary: Eliminar (lógico) un movimiento
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del movimiento a eliminar
 *     responses:
 *       200:
 *         description: Movimiento eliminado lógicamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Movimiento no encontrado
 */

/**
 * @swagger
 * /movimientos/{expedienteId}/historial:
 *   get:
 *     summary: Obtener historial de movimientos de un expediente
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expedienteId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del expediente
 *       - in: query
 *         name: tipo_destino
 *         schema:
 *           type: string
 *           enum: [interno, externo]
 *         required: false
 *         description: Filtrar movimientos por tipo de unidad de destino
 *       - in: query
 *         name: eliminados
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         required: false
 *         description: Incluir movimientos eliminados (solo supervisor)
 *     responses:
 *       200:
 *         description: Historial de movimientos del expediente
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
 *                   type: object
 *                   properties:
 *                     expediente:
 *                       $ref: '#/components/schemas/ExpedienteHistorial'
 *                     movimientos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movimiento'
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Expediente no encontrado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Movimiento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         expedienteId:
 *           type: integer
 *         tipo:
 *           type: string
 *           enum: [entrada, salida]
 *           example: "entrada"
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *           example: "2025-07-17"
 *         unidadDestinoId:
 *           type: integer
 *         unidadOrigenId:
 *           type: integer
 *         observaciones:
 *           type: string
 *         eliminado:
 *           type: boolean
 *         usuarioId:
 *           type: integer
 *         unidadDestino:
 *           $ref: '#/components/schemas/Unidad'
 *         unidadOrigen:
 *           $ref: '#/components/schemas/Unidad'
 *         usuario:
 *           $ref: '#/components/schemas/UsuarioBase'
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
 *           example: "salida"
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *           example: "2025-07-17"
 *         unidadDestinoId:
 *           type: integer
 *           example: 2
 *         unidadOrigenId:
 *           type: integer
 *           example: 1
 *         observaciones:
 *           type: string
 *           example: "Envío a Jurídica"
 *     MovimientoInputUpdate:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [entrada, salida]
 *         fecha_movimiento:
 *           type: string
 *           format: date
 *         unidadDestinoId:
 *           type: integer
 *         unidadOrigenId:
 *           type: integer
 *         observaciones:
 *           type: string
 *     MovimientoResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           $ref: '#/components/schemas/Movimiento'
 *     Unidad:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         tipo:
 *           type: string
 *           enum: [interno, externo]
 *     UsuarioBase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *     ExpedienteHistorial:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
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
 *         estado:
 *           type: string
 *           enum: [abierto, cerrado]
 *         creadoPorId:
 *           type: integer
 *         creador:
 *           $ref: '#/components/schemas/UsuarioBase'
 */

// Crear movimiento
router.post(
  "/",
  verifyToken,
  validarCrearMovimiento,
  chequearErrores,
  movimientoController.crearMovimiento
);

// Actualizar movimiento
router.put(
  "/:id",
  verifyToken,
  validarActualizarMovimiento,
  chequearErrores,
  movimientoController.actualizarMovimiento
);

// Eliminar movimiento
router.delete("/:id", verifyToken, movimientoController.eliminarMovimiento);

// Historial de expediente
router.get(
  "/:expedienteId/historial",
  verifyToken,
  movimientoController.historialExpediente
);

module.exports = router;
