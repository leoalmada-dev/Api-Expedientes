// src/validations/reportesValidator.js
const { query, param } = require('express-validator');

const rangoEnum = ['hoy','semana','mes'];
const plazoEnum = ['cumplido','incumplido'];
const destinoEnum = ['interno','externo','todos'];

exports.validReporteUsuarios = [
  query('rol').optional().isInt().toInt(),
  query('unidadId').optional().isInt().toInt(),
  query('buscar').optional().isString().trim().isLength({ max: 100 }),
  query('activo').optional().isIn(['semana']),
];

exports.validReporteExpedientes = [
  query('fecha_desde').optional().isISO8601(),
  query('fecha_hasta').optional().isISO8601(),
  query('rango').optional().isIn(rangoEnum),
  query('tipo_destino').optional().isIn(destinoEnum),
  query('tipo_documento').optional().isString().trim().isLength({ max: 30 }),
  query('referencia').optional().isString().trim().isLength({ max: 200 }),
  query('urgencia').optional().isIn(['comun','urgente']),
  query('plazo').optional().isIn(plazoEnum),
  query('limit').optional().isInt({ min:1, max:200 }).toInt(),
  query('page').optional().isInt({ min:1 }).toInt(),
  query('orderBy').optional().isIn(['fecha_ingreso','fecha_cierre','urgencia','estado']),
  query('orderDir').optional().isIn(['ASC','DESC']),
];

exports.validActividadUsuario = [
  param('usuarioId').isInt().toInt(),
  query('desde').optional().isISO8601(),
  query('hasta').optional().isISO8601(),
  query('rango').optional().isIn(rangoEnum),
  query('incluir').optional().isString(),
  query('limit').optional().isInt({ min:1, max:200 }).toInt(),
  query('offset').optional().isInt({ min:0 }).toInt(),
];
