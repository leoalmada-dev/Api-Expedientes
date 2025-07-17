const { Unidad } = require('../models');

// Listar todas las unidades
exports.listarUnidades = async (req, res) => {
  try {
    const unidades = await Unidad.findAll();
    res.json(unidades);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar unidades' });
  }
};

// Crear unidad
exports.crearUnidad = async (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'supervisor')
    return res.status(403).json({ error: 'No autorizado' });
  try {
    const { nombre } = req.body;
    const nueva = await Unidad.create({ nombre });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear unidad' });
  }
};

// Actualizar unidad
exports.actualizarUnidad = async (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'supervisor')
    return res.status(403).json({ error: 'No autorizado' });
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const unidad = await Unidad.findByPk(id);
    if (!unidad) return res.status(404).json({ error: 'Unidad no encontrada' });
    await unidad.update({ nombre });
    res.json(unidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar unidad' });
  }
};

// Eliminar unidad
exports.eliminarUnidad = async (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'supervisor')
    return res.status(403).json({ error: 'No autorizado' });
  try {
    const { id } = req.params;
    const unidad = await Unidad.findByPk(id);
    if (!unidad) return res.status(404).json({ error: 'Unidad no encontrada' });
    await unidad.destroy();
    res.json({ mensaje: 'Unidad eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar unidad' });
  }
};
