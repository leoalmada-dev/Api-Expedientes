// src/routes/reportes.js
const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const verifyToken = require('../middleware/verifyToken');
const requireRoles = require('../middleware/requireRoles');
const { validReporteUsuarios, validReporteExpedientes, validActividadUsuario } = require('../validations/reportesValidator');
const { validationResult } = require('express-validator');

const validate = (req,res,next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok:false, mensaje:'Parámetros inválidos', errores: errors.array() });
  next();
};

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Reportes de actividad, expedientes y usuarios
 */

/**
 * @swagger
 * /reportes/usuarios:
 *   get:
 *     summary: Resumen de actividad por usuario
 *     description: Devuelve métricas por usuario (totales históricos, actividad de la última semana y logins).
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rol
 *         schema:
 *           type: integer
 *         description: Filtrar por rolId
 *       - in: query
 *         name: unidadId
 *         schema:
 *           type: integer
 *         description: Filtrar por unidad
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Nombre, correo o CI (búsqueda parcial)
 *       - in: query
 *         name: activo
 *         schema:
 *           type: string
 *           enum: [semana]
 *         description: Si se establece "semana", solo usuarios con actividad en la semana
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteUsuariosResponse'
 *       401:
 *         description: Token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (requiere admin o supervisor)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /reportes/expedientes:
 *   get:
 *     summary: Reporte de expedientes con plazos y destino
 *     description: Lista de expedientes con cálculo de plazo (cumplido/incumplido/en curso) y destino del último movimiento de salida.
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: rango
 *         schema:
 *           type: string
 *           enum: [hoy, semana, mes]
 *       - in: query
 *         name: tipo_documento
 *         schema:
 *           type: string
 *       - in: query
 *         name: urgencia
 *         schema:
 *           type: string
 *           enum: [comun, urgente]
 *       - in: query
 *         name: referencia
 *         schema:
 *           type: string
 *           maxLength: 200
 *       - in: query
 *         name: tipo_destino
 *         schema:
 *           type: string
 *           enum: [interno, externo, todos]
 *       - in: query
 *         name: plazo
 *         schema:
 *           type: string
 *           enum: [cumplido, incumplido]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 200
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [fecha_ingreso, fecha_cierre, urgencia, estado, id]
 *           default: fecha_ingreso
 *       - in: query
 *         name: orderDir
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteExpedientesResponse'
 *       401:
 *         description: Token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (requiere admin, supervisor u operador)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /reportes/usuarios/{usuarioId}/actividad:
 *   get:
 *     summary: Actividad detallada de un usuario
 *     description: |
 *       Expedientes creados, movimientos realizados y auditoría (si aplica), con filtros por fecha y paginación.
 *       Ej. incluir: "creados,movimientos,auditoria"
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: rango
 *         schema:
 *           type: string
 *           enum: [hoy, semana, mes]
 *       - in: query
 *         name: incluir
 *         schema:
 *           type: string
 *         description: 'CSV de secciones a incluir. Ej.: "creados,movimientos,auditoria"'
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 200
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActividadUsuarioResponse'
 *       401:
 *         description: Token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (solo admin/supervisor o el propio usuario)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get("/usuarios",
  verifyToken,
  requireRoles('admin','supervisor'),
  validReporteUsuarios, validate,
  reportesController.reporteUsuarios
);

router.get("/expedientes",
  verifyToken,
  requireRoles('admin','supervisor','operador'),
  validReporteExpedientes, validate,
  reportesController.reporteExpedientes
);

router.get("/usuarios/:usuarioId/actividad",
  verifyToken,
  validActividadUsuario, validate,
  reportesController.actividadDeUsuario
);

module.exports = router;
