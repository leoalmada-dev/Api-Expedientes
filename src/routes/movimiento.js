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
 *         description: Movimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Movimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *                       $ref: '#/components/schemas/Expediente'
 *                     movimientos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movimiento'
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
