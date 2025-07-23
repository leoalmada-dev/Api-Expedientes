const { Movimiento, Expediente, Unidad, Usuario } = require("../models");

// Crear movimiento para un expediente existente
exports.crearMovimiento = async (req, res) => {
  try {
    // Solo admin, supervisor y operador pueden crear movimientos
    if (!["admin", "supervisor", "operador"].includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permiso para crear movimientos",
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

    // Busca el expediente y controla eliminado/cerrado
    const expediente = await Expediente.findByPk(expedienteId);
    if (!expediente || expediente.eliminado)
      return res.status(404).json({
        ok: false,
        mensaje: "Expediente no encontrado o ha sido eliminado"
      });

    // 🚫 NO permitir movimientos si está cerrado
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

// Obtener el historial completo de un expediente
exports.historialExpediente = async (req, res) => {
  try {
    const { expedienteId } = req.params;
    const { eliminados } = req.query;

    // Buscar expediente
    const expediente = await Expediente.findByPk(expedienteId, {
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
        mensaje: "No tiene permiso para consultar el historial de un expediente eliminado"
      });

    // Solo el supervisor puede listar movimientos eliminados
    let whereMov = { expedienteId };
    if (eliminados === "true") {
      if (req.user.rol !== "supervisor") {
        return res.status(403).json({
          ok: false,
          mensaje: "No tiene permiso para ver movimientos eliminados"
        });
      }
      whereMov.eliminado = true;
    } else {
      whereMov.eliminado = false;
    }

    const movimientos = await Movimiento.findAll({
      where: whereMov,
      include: [
        { model: Unidad, as: "unidadDestino", attributes: ["id", "nombre"] },
        { model: Unidad, as: "unidadOrigen", attributes: ["id", "nombre"] },
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "correo"],
        },
      ],
      order: [["fecha_movimiento", "ASC"]],
    });

    res.json({
      ok: true,
      mensaje: "Historial de movimientos obtenido correctamente",
      datos: { expediente, movimientos }
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ ok: false, mensaje: "Error al obtener historial de movimientos", error });
  }
};

// Actualizar movimiento
exports.actualizarMovimiento = async (req, res) => {
  try {
    // Solo admin y supervisor pueden actualizar movimientos
    if (!["admin", "supervisor"].includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permiso para actualizar movimientos",
      });
    }

    const { id } = req.params;
    const datos = req.body;

    const movimiento = await Movimiento.findByPk(id);
    if (!movimiento)
      return res.status(404).json({ ok: false, mensaje: "Movimiento no encontrado" });
    if (movimiento.eliminado && req.user.rol !== "supervisor")
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permiso para editar un movimiento eliminado",
      });

    await movimiento.update(datos);
    res.json({
      ok: true,
      mensaje: "Movimiento actualizado correctamente",
      datos: movimiento,
    });
  } catch (error) {
    console.error("Error al actualizar movimiento:", error);
    res.status(500).json({ ok: false, mensaje: "Error al actualizar movimiento", error });
  }
};

// Eliminación lógica de movimiento
exports.eliminarMovimiento = async (req, res) => {
  try {
    // Solo admin y supervisor pueden eliminar movimientos
    if (!["admin", "supervisor"].includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tiene permiso para eliminar movimientos",
      });
    }

    const { id } = req.params;
    const movimiento = await Movimiento.findByPk(id);
    if (!movimiento)
      return res.status(404).json({ ok: false, mensaje: "Movimiento no encontrado" });

    // 🚫 Controlar si el expediente está cerrado
    const expediente = await Expediente.findByPk(movimiento.expedienteId);
    if (expediente && expediente.estado === "cerrado")
      return res.status(409).json({
        ok: false,
        mensaje: "No se puede eliminar movimientos de un expediente cerrado"
      });

    if (movimiento.eliminado)
      return res
        .status(400)
        .json({ ok: false, mensaje: "El movimiento ya estaba eliminado" });

    await movimiento.update({ eliminado: true });

    res.json({ ok: true, mensaje: "Movimiento eliminado lógicamente." });
  } catch (error) {
    console.error("Error al eliminar movimiento:", error);
    res.status(500).json({ ok: false, mensaje: "Error al eliminar movimiento", error });
  }
};
