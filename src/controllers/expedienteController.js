const { Expediente, Movimiento, Unidad, Usuario } = require("../models");

// Crear expediente (con primer movimiento opcional)
exports.crearExpediente = async (req, res) => {
  try {
    const {
      tipo_documento,
      numero_documento,
      forma_ingreso,
      fecha_ingreso,
      procedencia,
      dependencia_origen,
      referencia,
      detalle,
      primer_movimiento, // opcional
    } = req.body;

    // Tomá el usuario desde el JWT
    const usuarioId = req.user.id;

    const expediente = await Expediente.create({
      tipo_documento,
      numero_documento,
      forma_ingreso,
      fecha_ingreso,
      procedencia,
      dependencia_origen,
      referencia,
      detalle,
      creadoPorId: usuarioId,
    });

    // Si hay un primer movimiento, lo crea asociado
    if (primer_movimiento) {
      await Movimiento.create({
        expedienteId: expediente.id,
        ...primer_movimiento,
        usuarioId // El usuario autenticado
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
    if (!expediente)
      return res.status(404).json({ error: "Expediente no encontrado" });

    const movimiento = await Movimiento.create({
      expedienteId,
      tipo,
      fecha_movimiento,
      unidadDestinoId,
      unidadOrigenId,
      usuarioId, // tomado del JWT
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
    if (!expediente) return res.status(404).json({ error: "No encontrado" });
    res.json(expediente);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener expediente" });
  }
};
