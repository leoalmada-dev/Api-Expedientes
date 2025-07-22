const { Op } = require("sequelize");
const {
  Expediente,
  Movimiento,
  Unidad,
  Usuario,
  LogEliminacion,
} = require("../models");

// ⚠️ Importa los validadores y validationResult para usar en el controller
const { validarCrearMovimiento } = require('../validations/movimientoValidator');
const { validationResult } = require('express-validator');

// Crear expediente (con primer movimiento opcional y validado)
exports.crearExpediente = async (req, res) => {
  try {
    const {
      tipo_documento,
      numero_documento,
      forma_ingreso,
      fecha_ingreso,
      referencia,
      detalle,
      primer_movimiento, // opcional
    } = req.body;

    // Validar primer_movimiento si existe
    if (primer_movimiento) {
      const mockReq = { body: primer_movimiento };
      const mockRes = {};
      await Promise.all(validarCrearMovimiento.map(val => val.run(mockReq, mockRes)));
      const errors = validationResult(mockReq);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Datos inválidos en primer movimiento',
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
    });

    if (primer_movimiento) {
      await Movimiento.create({
        expedienteId: expediente.id,
        ...primer_movimiento,
        usuarioId,
      });
    }

    res.status(201).json({
      ok: true,
      mensaje: "Expediente creado correctamente",
      datos: expediente,
    });
  } catch (error) {
    console.error("Error al crear expediente:", error);
    res.status(500).json({ ok: false, mensaje: "Error al crear expediente", error });
  }
};

// Crear movimiento para un expediente existente
exports.crearMovimiento = async (req, res) => {
  try {
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
        mensaje: "Expediente no encontrado o ha sido eliminado"
      });

    // 🚦 Controlar que NO se puedan registrar movimientos en expedientes cerrados
    if (expediente.estado === "cerrado")
      return res.status(409).json({
        ok: false,
        mensaje: "No se pueden registrar movimientos en un expediente cerrado"
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

    res.status(201).json({
      ok: true,
      mensaje: "Movimiento creado correctamente",
      datos: movimiento,
    });
  } catch (error) {
    console.error("Error al crear movimiento:", error);
    res.status(500).json({ ok: false, mensaje: "Error al crear movimiento", error });
  }
};

// Consultar expediente con info de su creador
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
      return res.status(404).json({ ok: false, mensaje: "Expediente no encontrado" });

    // Si está eliminado y no es supervisor, no puede verlo
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
    res.status(500).json({ ok: false, mensaje: "Error al obtener expediente", error });
  }
};

// Listar expedientes con filtros (solo no eliminados)
exports.listarExpedientes = async (req, res) => {
  try {
    const { tipo_documento, fecha_desde, fecha_hasta, eliminados } = req.query;

    const where = {};
    // Solo el supervisor puede ver eliminados
    if (eliminados === "true") {
      if (req.user.rol !== "supervisor") {
        return res
          .status(403)
          .json({ ok: false, mensaje: "No tiene permiso para ver expedientes eliminados" });
      }
      where.eliminado = true;
    } else {
      where.eliminado = false;
    }

    if (tipo_documento) where.tipo_documento = tipo_documento;
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
        // { model: Unidad },
      ],
      order: [["fecha_ingreso", "DESC"]],
    });

    res.json({
      ok: true,
      mensaje: "Expedientes listados correctamente",
      datos: expedientes,
    });
  } catch (error) {
    console.error("Error al listar expedientes:", error);
    res.status(500).json({ ok: false, mensaje: "Error al listar expedientes", error });
  }
};

// Actualizar expediente
exports.actualizarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res.status(404).json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res.status(410).json({ ok: false, mensaje: "No se puede modificar un expediente eliminado." });

    await expediente.update(datos);
    res.json({
      ok: true,
      mensaje: "Expediente actualizado correctamente",
      datos: expediente,
    });
  } catch (error) {
    console.error("Error al actualizar expediente:", error);
    res.status(500).json({ ok: false, mensaje: "Error al actualizar expediente", error });
  }
};

// Eliminación lógica con log de auditoría
exports.eliminarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res.status(404).json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res.status(400).json({ ok: false, mensaje: "El expediente ya estaba eliminado" });

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

    res.json({
      ok: true,
      mensaje: "Expediente eliminado lógicamente y respaldado en log."
    });
  } catch (error) {
    console.error("Error al eliminar expediente:", error);
    res.status(500).json({ ok: false, mensaje: "Error al eliminar expediente", error });
  }
};

// Cerrar expediente
exports.cerrarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const expediente = await Expediente.findByPk(id);

    if (!expediente)
      return res.status(404).json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res.status(410).json({ ok: false, mensaje: "No se puede cerrar un expediente eliminado." });
    if (req.user.rol !== "supervisor")
      return res.status(403).json({ ok: false, mensaje: "Solo el supervisor puede cerrar expedientes" });

    await expediente.update({
      estado: "cerrado",
      cerradoPorId: usuarioId,
      fecha_cierre: new Date(),
    });

    res.json({ ok: true, mensaje: "Expediente cerrado correctamente" });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al cerrar expediente", error });
  }
};

// Reabrir expediente
exports.reabrirExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const expediente = await Expediente.findByPk(id);

    if (!expediente)
      return res.status(404).json({ ok: false, mensaje: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res.status(410).json({ ok: false, mensaje: "No se puede reabrir un expediente eliminado." });
    if (req.user.rol !== "supervisor")
      return res.status(403).json({ ok: false, mensaje: "Solo el supervisor puede reabrir expedientes" });

    await expediente.update({
      estado: "abierto",
      cerradoPorId: null,
      fecha_cierre: null,
    });

    res.json({ ok: true, mensaje: "Expediente reabierto correctamente" });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al reabrir expediente", error });
  }
};
