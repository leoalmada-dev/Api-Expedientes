const { Movimiento, Expediente, Unidad, Usuario } = require("../models");

// Crear un nuevo movimiento para un expediente existente
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

    // Verifica que el expediente exista y no esté eliminado
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
      return res.status(404).json({ error: "Expediente no encontrado" });

    // Si está eliminado y no es supervisor, no puede verlo
    if (expediente.eliminado && req.user.rol !== "supervisor")
      return res
        .status(403)
        .json({
          error:
            "No tiene permiso para consultar el historial de un expediente eliminado",
        });

    // Solo el supervisor puede listar movimientos eliminados
    let whereMov = { expedienteId };
    if (eliminados === "true") {
      if (req.user.rol !== "supervisor") {
        return res
          .status(403)
          .json({ error: "No tiene permiso para ver movimientos eliminados" });
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

    res.json({ expediente, movimientos });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res
      .status(500)
      .json({ error: "Error al obtener historial de movimientos" });
  }
};

// Actualizar movimiento
exports.actualizarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const movimiento = await Movimiento.findByPk(id);
    if (!movimiento)
      return res.status(404).json({ error: "Movimiento no encontrado" });
    if (movimiento.eliminado && req.user.rol !== "supervisor")
      return res
        .status(403)
        .json({
          error: "No tiene permiso para editar un movimiento eliminado",
        });

    await movimiento.update(datos);
    res.json({ mensaje: "Movimiento actualizado", movimiento });
  } catch (error) {
    console.error("Error al actualizar movimiento:", error);
    res.status(500).json({ error: "Error al actualizar movimiento" });
  }
};

// Eliminación lógica de movimiento
exports.eliminarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const movimiento = await Movimiento.findByPk(id);
    if (!movimiento)
      return res.status(404).json({ error: "Movimiento no encontrado" });
    if (movimiento.eliminado)
      return res
        .status(400)
        .json({ error: "El movimiento ya estaba eliminado" });

    await movimiento.update({ eliminado: true });

    res.json({ mensaje: "Movimiento eliminado lógicamente." });
  } catch (error) {
    console.error("Error al eliminar movimiento:", error);
    res.status(500).json({ error: "Error al eliminar movimiento" });
  }
};
