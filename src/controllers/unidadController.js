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
    // Auditoría tolerante a errores
    try {
      await registrarAuditoria({
        entidad: "unidad",
        entidadId: nueva.id,
        accion: "crear",
        usuarioId: req.user.id,
        descripcion: `Creada unidad: nombre="${nombre}", tipo="${tipo}"`
      });
    } catch (e) {
      console.error("Error registrando auditoría (crear unidad):", e);
    }
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

    const datosViejos = { nombre: unidad.nombre, tipo: unidad.tipo };

    await unidad.update({ nombre, tipo });

    // Auditoría tolerante a errores
    try {
      await registrarAuditoria({
        entidad: "unidad",
        entidadId: unidad.id,
        accion: "actualizar",
        usuarioId: req.user.id,
        descripcion: `De ${JSON.stringify(datosViejos)} a ${JSON.stringify({ nombre, tipo })}`
      });
    } catch (e) {
      console.error("Error registrando auditoría (actualizar unidad):", e);
    }

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

    const datosEliminados = { nombre: unidad.nombre, tipo: unidad.tipo };

    await unidad.destroy();

    // Auditoría tolerante a errores
    try {
      await registrarAuditoria({
        entidad: "unidad",
        entidadId: unidad.id,
        accion: "eliminar",
        usuarioId: req.user.id,
        descripcion: `Unidad eliminada: ${JSON.stringify(datosEliminados)}`
      });
    } catch (e) {
      console.error("Error registrando auditoría (eliminar unidad):", e);
    }

    res.json({ ok: true, mensaje: 'Unidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar unidad', error });
  }
};


