const { Op } = require("sequelize");
const {
  Expediente,
  Movimiento,
  Usuario,
  LogEliminacion,
} = require("../models");
const {
  validarCrearMovimiento,
} = require("../validations/movimientoValidator");
const { validationResult } = require("express-validator");
const registrarAuditoria = require("../helpers/registrarAuditoria");

// === Helper de permisos ===
const puedeGestionar = (rol) => ["admin", "supervisor"].includes(rol);
const puedeCrearMovimiento = (rol) =>
  ["admin", "supervisor", "operador"].includes(rol);

// === Crear expediente (con primer movimiento opcional y validado) ===
exports.crearExpediente = async (req, res) => {
  try {
    // Solo admin, supervisor y operador pueden crear expedientes
    if (!puedeCrearMovimiento(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permisos para crear expedientes",
      });
    }

    const {
      tipo_documento,
      numero_documento,
      forma_ingreso,
      fecha_ingreso,
      referencia,
      detalle,
      urgencia = "comun", // Valor por defecto
      primer_movimiento,
    } = req.body;

    // Validar que urgencia sea válida
    if (!["comun", "urgente"].includes(urgencia)) {
      return res.status(400).json({
        ok: false,
        mensaje: "La urgencia debe ser 'comun' o 'urgente'",
      });
    }

    // Validar primer_movimiento si existe
    if (primer_movimiento && !puedeCrearMovimiento(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permisos para crear movimientos",
      });
    }

    if (primer_movimiento) {
      const mockReq = { body: primer_movimiento };
      const mockRes = {};
      await Promise.all(
        validarCrearMovimiento.map((val) => val.run(mockReq, mockRes))
      );
      const errors = validationResult(mockReq);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          ok: false,
          mensaje: "Datos inválidos en primer movimiento",
          errores: errors.array(),
        });
      }
    }

    const usuarioId = req.user.id;

    const expediente = await Expediente.create({
      tipo_documento,
      numero_documento,
      forma_ingreso,
      fecha_ingreso,
      referencia,
      detalle,
      creadoPorId: usuarioId,
      urgencia, // NUEVO CAMPO
    });

    // Auditoría expediente creado
    try {
      await registrarAuditoria({
        entidad: "expediente",
        entidadId: expediente.id,
        accion: "crear",
        usuarioId,
        descripcion: `Creado expediente: tipo_documento="${tipo_documento}", numero_documento="${numero_documento}", urgencia="${urgencia}", referencia="${referencia}"`,
      });
    } catch (e) {
      console.error("Error registrando auditoría (crear expediente):", e);
    }

    if (primer_movimiento) {
      const movimiento = await Movimiento.create({
        expedienteId: expediente.id,
        ...primer_movimiento,
        usuarioId,
      });
      // Auditoría primer movimiento
      try {
        await registrarAuditoria({
          entidad: "movimiento",
          entidadId: movimiento.id,
          accion: "crear",
          usuarioId,
          descripcion: `Primer movimiento del expediente ${expediente.id}: ${JSON.stringify(primer_movimiento)}`
        });
      } catch (e) {
        console.error("Error registrando auditoría (primer movimiento):", e);
      }
    }

    res.status(201).json({
      ok: true,
      mensaje: "Expediente creado correctamente",
      datos: expediente,
    });
  } catch (error) {
    console.error("Error al crear expediente:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al crear expediente", error });
  }
};

// === Crear movimiento para un expediente existente ===
exports.crearMovimiento = async (req, res) => {
  try {
    // Solo admin, supervisor y operador pueden crear movimientos
    if (!puedeCrearMovimiento(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permisos para crear movimientos",
      });
    }
    const { expedienteId } = req.params;
    const {
      tipo,
      fecha_movimiento,
      unidadDestinoId,
      unidadOrigenId,
      observaciones,
    } = req.body;

    const usuarioId = req.user.id;
    const expediente = await Expediente.findByPk(expedienteId);
    if (!expediente || expediente.eliminado)
      return res.status(404).json({
        ok: false,
        mensaje: "Expediente no encontrado o ha sido eliminado",
      });

    if (expediente.estado === "cerrado")
      return res.status(409).json({
        ok: false,
        mensaje: "No se pueden registrar movimientos en un expediente cerrado",
      });

    const movimiento = await Movimiento.create({
      expedienteId,
      tipo,
      fecha_movimiento,
      unidadDestinoId,
      unidadOrigenId,
      usuarioId,
      observaciones,
    });

    // Auditoría movimiento creado
    try {
      await registrarAuditoria({
        entidad: "movimiento",
        entidadId: movimiento.id,
        accion: "crear",
        usuarioId,
        descripcion: `Movimiento agregado a expedienteId=${expedienteId}: tipo=${tipo}, fecha_movimiento=${fecha_movimiento}, unidadDestinoId=${unidadDestinoId}, unidadOrigenId=${unidadOrigenId}, observaciones="${observaciones}"`
      });
    } catch (e) {
      console.error("Error registrando auditoría (crear movimiento):", e);
    }

    res.status(201).json({
      ok: true,
      mensaje: "Movimiento creado correctamente",
      datos: movimiento,
    });
  } catch (error) {
    console.error("Error al crear movimiento:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al crear movimiento", error });
  }
};

// === Consultar expediente con info de su creador ===
exports.obtenerExpediente = async (req, res) => {
  try {
    const expediente = await Expediente.findByPk(req.params.id, {
      include: [
        {
          model: Usuario,
          as: "creador",
          attributes: ["id", "nombre", "correo"],
        },
      ],
    });
    if (!expediente)
      return res
        .status(404)
        .json({ ok: false, mensaje: "Expediente no encontrado" });

    if (expediente.eliminado && req.user.rol !== "supervisor")
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permiso para consultar expedientes eliminados",
      });

    res.json({
      ok: true,
      mensaje: "Expediente obtenido correctamente",
      datos: expediente,
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al obtener expediente", error });
  }
};

// === Listar expedientes con filtros (solo no eliminados) ===
exports.listarExpedientes = async (req, res) => {
  try {
    const { tipo_documento, fecha_desde, fecha_hasta, eliminados, estado } =
      req.query;

    const where = {};

    // Validación de permisos para eliminados
    if (eliminados === "true") {
      if (req.user.rol !== "supervisor") {
        return res.status(403).json({
          ok: false,
          mensaje: "No tiene permiso para ver expedientes eliminados",
        });
      }
      where.eliminado = true;
    } else {
      where.eliminado = false;
    }

    // Filtro por tipo de documento
    if (tipo_documento) where.tipo_documento = tipo_documento;

    // Filtro por estado
    if (estado) where.estado = estado;

    // Filtro por fechas
    if (fecha_desde && fecha_hasta) {
      where.fecha_ingreso = { [Op.between]: [fecha_desde, fecha_hasta] };
    } else if (fecha_desde) {
      where.fecha_ingreso = { [Op.gte]: fecha_desde };
    } else if (fecha_hasta) {
      where.fecha_ingreso = { [Op.lte]: fecha_hasta };
    }

    const expedientes = await Expediente.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "creador",
          attributes: ["id", "nombre", "correo"],
        },
      ],
      order: [["id", "ASC"]],
    });

    // ✅ Respuesta si no se encuentra ningún expediente
    if (expedientes.length === 0) {
      return res.status(200).json({
        ok: true,
        mensaje: "No se encontraron expedientes con los filtros aplicados",
        datos: [],
      });
    }

    res.json({
      ok: true,
      mensaje: "Expedientes listados correctamente",
      datos: expedientes,
    });
  } catch (error) {
    console.error("Error al listar expedientes:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al listar expedientes",
      error,
    });
  }
};

// === Actualizar expediente ===
exports.actualizarExpediente = async (req, res) => {
  try {
    // Solo admin y supervisor pueden actualizar
    if (!puedeGestionar(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permisos para modificar expedientes",
      });
    }
    const { id } = req.params;
    const datos = req.body;
    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res
        .status(404)
        .json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res.status(410).json({
        ok: false,
        mensaje: "No se puede modificar un expediente eliminado.",
      });

    // Detectar los campos modificados
    const datosViejos = {};
    for (const key of Object.keys(datos)) {
      if (expediente[key] !== undefined && expediente[key] !== datos[key]) {
        datosViejos[key] = expediente[key];
      }
    }

    await expediente.update(datos);

    // Auditoría actualización
    try {
      await registrarAuditoria({
        entidad: "expediente",
        entidadId: expediente.id,
        accion: "actualizar",
        usuarioId: req.user.id,
        descripcion: `Modificado(s): ${Object.keys(datos).join(", ")}. De ${JSON.stringify(datosViejos)} a ${JSON.stringify(datos)}`
      });
    } catch (e) {
      console.error("Error registrando auditoría (actualizar expediente):", e);
    }

    res.json({
      ok: true,
      mensaje: "Expediente actualizado correctamente",
      datos: expediente,
    });
  } catch (error) {
    console.error("Error al actualizar expediente:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al actualizar expediente", error });
  }
};

// === Eliminación lógica con log de auditoría ===
exports.eliminarExpediente = async (req, res) => {
  try {
    // Solo admin y supervisor pueden eliminar
    if (!puedeGestionar(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permisos para eliminar expedientes",
      });
    }
    const { id } = req.params;
    const usuarioId = req.user.id;
    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res
        .status(404)
        .json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res
        .status(400)
        .json({ ok: false, mensaje: "El expediente ya estaba eliminado" });

    const datosEliminados = {
      tipo_documento: expediente.tipo_documento,
      numero_documento: expediente.numero_documento,
      urgencia: expediente.urgencia,
      referencia: expediente.referencia,
      detalle: expediente.detalle,
    };

    await expediente.update({ eliminado: true });
    await Movimiento.update(
      { eliminado: true },
      { where: { expedienteId: id } }
    );
    await LogEliminacion.create({
      expedienteId: id,
      usuarioId,
      fecha: new Date(),
    });

    // Auditoría eliminación
    try {
      await registrarAuditoria({
        entidad: "expediente",
        entidadId: expediente.id,
        accion: "eliminar",
        usuarioId,
        descripcion: `Expediente eliminado: ${JSON.stringify(datosEliminados)}`
      });
    } catch (e) {
      console.error("Error registrando auditoría (eliminar expediente):", e);
    }

    res.json({
      ok: true,
      mensaje: "Expediente eliminado lógicamente y respaldado en log.",
    });
  } catch (error) {
    console.error("Error al eliminar expediente:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al eliminar expediente", error });
  }
};

// === Cerrar expediente ===
exports.cerrarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res
        .status(404)
        .json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res.status(410).json({
        ok: false,
        mensaje: "No se puede cerrar un expediente eliminado.",
      });
    if (req.user.rol !== "supervisor")
      return res.status(403).json({
        ok: false,
        mensaje: "Solo el supervisor puede cerrar expedientes",
      });
    await expediente.update({
      estado: "cerrado",
      cerradoPorId: usuarioId,
      fecha_cierre: new Date(),
    });

    // Auditoría cierre
    try {
      await registrarAuditoria({
        entidad: "expediente",
        entidadId: expediente.id,
        accion: "cerrar",
        usuarioId,
        descripcion: `Expediente cerrado por usuario ${usuarioId} en ${new Date().toISOString()}`
      });
    } catch (e) {
      console.error("Error registrando auditoría (cerrar expediente):", e);
    }

    res.json({ ok: true, mensaje: "Expediente cerrado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al cerrar expediente", error });
  }
};

// === Reabrir expediente ===
exports.reabrirExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res
        .status(404)
        .json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res.status(410).json({
        ok: false,
        mensaje: "No se puede reabrir un expediente eliminado.",
      });
    if (req.user.rol !== "supervisor")
      return res.status(403).json({
        ok: false,
        mensaje: "Solo el supervisor puede reabrir expedientes",
      });
    await expediente.update({
      estado: "abierto",
      cerradoPorId: null,
      fecha_cierre: null,
    });

    // Auditoría reabrir
    try {
      await registrarAuditoria({
        entidad: "expediente",
        entidadId: expediente.id,
        accion: "reabrir",
        usuarioId: req.user.id,
        descripcion: `Expediente reabierto por usuario ${req.user.id} en ${new Date().toISOString()}`
      });
    } catch (e) {
      console.error("Error registrando auditoría (reabrir expediente):", e);
    }

    res.json({ ok: true, mensaje: "Expediente reabierto correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al reabrir expediente", error });
  }
};
