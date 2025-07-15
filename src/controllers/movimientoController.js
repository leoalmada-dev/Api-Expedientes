const { Movimiento, Expediente, Unidad, Usuario } = require('../models');

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

    const usuarioId = req.user.id; // Usuario autenticado

    // Verifica que el expediente exista
    const expediente = await Expediente.findByPk(expedienteId);
    if (!expediente)
      return res.status(404).json({ error: "Expediente no encontrado" });

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

// Obtener todos los movimientos de un expediente (historial)
exports.historialExpediente = async (req, res) => {
  try {
    const { expedienteId } = req.params;
    const expediente = await Expediente.findByPk(expedienteId, {
      include: [
        {
          model: Movimiento,
          include: [
            { model: Unidad, as: 'unidadDestino' },
            { model: Unidad, as: 'unidadOrigen' },
            { model: Usuario, as: 'usuario' }
          ],
          order: [['fecha_movimiento', 'ASC']]
        }
      ]
    });

    if (!expediente) return res.status(404).json({ error: 'Expediente no encontrado' });

    res.json({
      expediente,
      movimientos: expediente.Movimientos
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial de movimientos' });
  }
};
