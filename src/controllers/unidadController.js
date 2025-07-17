const { Unidad } = require('../models');

// Listar todas las unidades
exports.listarUnidades = async (req, res) => {
  try {
    const unidades = await Unidad.findAll();
    res.json({ ok: true, mensaje: "Unidades listadas correctamente", datos: unidades });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al listar unidades', error });
  }
};

// Crear unidad
exports.crearUnidad = async (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'supervisor')
    return res.status(403).json({ ok: false, mensaje: 'No autorizado' });
  try {
    const { nombre } = req.body;
    const nueva = await Unidad.create({ nombre });
    res.status(201).json({ ok: true, mensaje: "Unidad creada correctamente", datos: nueva });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear unidad', error });
  }
};

// Actualizar unidad
exports.actualizarUnidad = async (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'supervisor')
    return res.status(403).json({ ok: false, mensaje: 'No autorizado' });
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const unidad = await Unidad.findByPk(id);
    if (!unidad)
      return res.status(404).json({ ok: false, mensaje: 'Unidad no encontrada' });
    await unidad.update({ nombre });
    res.json({ ok: true, mensaje: "Unidad actualizada correctamente", datos: unidad });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar unidad', error });
  }
};

// Eliminar unidad
exports.eliminarUnidad = async (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'supervisor')
    return res.status(403).json({ ok: false, mensaje: 'No autorizado' });
  try {
    const { id } = req.params;
    const unidad = await Unidad.findByPk(id);
    if (!unidad)
      return res.status(404).json({ ok: false, mensaje: 'Unidad no encontrada' });
    await unidad.destroy();
    res.json({ ok: true, mensaje: 'Unidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar unidad', error });
  }
};
