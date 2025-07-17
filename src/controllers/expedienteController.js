const { Op } = require("sequelize");
const {
  Expediente,
  Movimiento,
  Unidad,
  Usuario,
  LogEliminacion,
} = require("../models");

// Crear expediente (con primer movimiento opcional)
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

    res.status(201).json({ mensaje: "Expediente creado", expediente });
  } catch (error) {
    console.error("Error al crear expediente:", error);
    res.status(500).json({ error: "Error al crear expediente" });
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
      return res
        .status(404)
        .json({ error: "Expediente no encontrado o ha sido eliminado" });

    const movimiento = await Movimiento.create({
      expedienteId,
      tipo,
      fecha_movimiento,
      unidadDestinoId,
      unidadOrigenId,
      usuarioId,
      observaciones,
    });

    res.status(201).json({ mensaje: "Movimiento creado", movimiento });
  } catch (error) {
    console.error("Error al crear movimiento:", error);
    res.status(500).json({ error: "Error al crear movimiento" });
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
      return res.status(404).json({ error: "Expediente no encontrado" });

    // Si está eliminado y no es supervisor, no puede verlo
    if (expediente.eliminado && req.user.rol !== "supervisor")
      return res.status(403).json({
        error: "No tiene permiso para consultar expedientes eliminados",
      });

    res.json(expediente);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener expediente" });
  }
};

// Listar expedientes con filtros (solo no eliminados)
exports.listarExpedientes = async (req, res) => {
  try {
    const { tipo_documento, fecha_desde, fecha_hasta, eliminados } =
      req.query;

    const where = {};
    // Solo el supervisor puede ver eliminados
    if (eliminados === "true") {
      if (req.user.rol !== "supervisor") {
        return res
          .status(403)
          .json({ error: "No tiene permiso para ver expedientes eliminados" });
      }
      where.eliminado = true;
    } else {
      where.eliminado = false;
    }

    // if (unidadId) where.unidadId = unidadId;
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
        { model: Unidad },
      ],
      order: [["fecha_ingreso", "DESC"]],
    });

    res.json(expedientes);
  } catch (error) {
    console.error("Error al listar expedientes:", error);
    res.status(500).json({ error: "Error al listar expedientes" });
  }
};

// Actualizar expediente
exports.actualizarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res.status(404).json({ error: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res
        .status(410)
        .json({ error: "No se puede modificar un expediente eliminado." });

    await expediente.update(datos);
    res.json({ mensaje: "Expediente actualizado", expediente });
  } catch (error) {
    console.error("Error al actualizar expediente:", error);
    res.status(500).json({ error: "Error al actualizar expediente" });
  }
};

// Eliminación lógica con log de auditoría
exports.eliminarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const expediente = await Expediente.findByPk(id);
    if (!expediente)
      return res.status(404).json({ error: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res
        .status(400)
        .json({ error: "El expediente ya estaba eliminado" });

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
      mensaje: "Expediente eliminado lógicamente y respaldado en log.",
    });
  } catch (error) {
    console.error("Error al eliminar expediente:", error);
    res.status(500).json({ error: "Error al eliminar expediente" });
  }
};

// Cerrar expediente
exports.cerrarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const expediente = await Expediente.findByPk(id);

    if (!expediente)
      return res.status(404).json({ error: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res
        .status(410)
        .json({ error: "No se puede cerrar un expediente eliminado." });
    if (req.user.rol !== "supervisor")
      return res
        .status(403)
        .json({ error: "Solo el supervisor puede cerrar expedientes" });

    await expediente.update({
      estado: "cerrado",
      cerradoPorId: usuarioId,
      fecha_cierre: new Date(),
    });

    res.json({ mensaje: "Expediente cerrado" });
  } catch (error) {
    res.status(500).json({ error: "Error al cerrar expediente" });
  }
};

// Reabrir expediente
exports.reabrirExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const expediente = await Expediente.findByPk(id);

    if (!expediente)
      return res.status(404).json({ error: "Expediente no encontrado" });
    if (expediente.eliminado)
      return res
        .status(410)
        .json({ error: "No se puede reabrir un expediente eliminado." });
    if (req.user.rol !== "supervisor")
      return res
        .status(403)
        .json({ error: "Solo el supervisor puede reabrir expedientes" });

    await expediente.update({
      estado: "abierto",
      cerradoPorId: null,
      fecha_cierre: null,
    });

    res.json({ mensaje: "Expediente reabierto" });
  } catch (error) {
    res.status(500).json({ error: "Error al reabrir expediente" });
  }
};
