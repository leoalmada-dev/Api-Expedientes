// src/helpers/registrarAuditoria.js

const { Auditoria } = require('../models');

/**
 * Registra una acción de auditoría simple.
 * @param {Object} params
 * @param {String} params.entidad - 'usuario', 'unidad', etc.
 * @param {Number} params.entidadId - ID de la entidad afectada
 * @param {String} params.accion - 'crear', 'actualizar', 'eliminar'
 * @param {Number} params.usuarioId - ID del usuario que hizo la acción
 * @param {String} [params.descripcion] - Info adicional (ej: cambios realizados)
 */
async function registrarAuditoria({ entidad, entidadId, accion, usuarioId, descripcion }) {
  try {
    await Auditoria.create({
      entidad,
      entidad_id: entidadId,
      accion,
      usuario_id: usuarioId,
      descripcion: descripcion || null,
      creado_en: new Date(),
    });
  } catch (error) {
    // Solo loguea, nunca lances para no romper el flujo principal.
    console.error("Error registrando auditoría:", error);
  }
}

module.exports = registrarAuditoria;
