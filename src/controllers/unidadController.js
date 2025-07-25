const { Unidad } = require('../models');
const registrarAuditoria = require('../helpers/registrarAuditoria');

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
    const { nombre, tipo = "interno" } = req.body;
    const nueva = await Unidad.create({ nombre, tipo });
    
    // 🔎 Auditoría
    await registrarAuditoria({
      entidad: 'unidad',
      entidadId: nueva.id,
      accion: 'crear',
      usuarioId: req.user.id,
      descripcion: `Unidad creada: nombre="${nombre}", tipo="${tipo}"`
    });

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
    const { nombre, tipo } = req.body;
    const unidad = await Unidad.findByPk(id);
    if (!unidad)
      return res.status(404).json({ ok: false, mensaje: 'Unidad no encontrada' });

    // Guarda valores viejos para auditoría (opcional, pero profesional)
    const datosAnteriores = { nombre: unidad.nombre, tipo: unidad.tipo };

    await unidad.update({ nombre, tipo });

    // 🔎 Auditoría
    await registrarAuditoria({
      entidad: 'unidad',
      entidadId: unidad.id,
      accion: 'actualizar',
      usuarioId: req.user.id,
      descripcion: `Actualización: de ${JSON.stringify(datosAnteriores)} a { nombre: "${nombre}", tipo: "${tipo}" }`
    });

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

    // Auditoría: guarda datos ANTES de eliminar
    const datosAntes = { nombre: unidad.nombre, tipo: unidad.tipo };

    await unidad.destroy();

    await registrarAuditoria({
      entidad: 'unidad',
      entidadId: id,
      accion: 'eliminar',
      usuarioId: req.user.id,
      descripcion: `Unidad eliminada: ${JSON.stringify(datosAntes)}`
    });

    res.json({ ok: true, mensaje: 'Unidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar unidad', error });
  }
};

