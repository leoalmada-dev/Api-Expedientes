const { Usuario, Rol, Unidad } = require("../models");
const bcrypt = require("bcryptjs");

// Listar usuarios
exports.listarUsuarios = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ ok: false, mensaje: "No autorizado" });
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["contraseña"] },
      include: [
        { model: Rol, attributes: ["nombre"] },
        { model: Unidad, attributes: ["nombre"] },
      ],
    });
    res.json({ ok: true, mensaje: "Usuarios listados correctamente", datos: usuarios });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ ok: false, mensaje: "Error al listar usuarios", error });
  }
};

// Crear usuario
exports.crearUsuario = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ ok: false, mensaje: "No autorizado" });
  try {
    const { nombre, ci, correo, contraseña, rolId, unidadId } = req.body;
    const existe = await Usuario.findOne({ where: { ci } });
    if (existe)
      return res.status(409).json({ ok: false, mensaje: "El CI ya está registrado" });

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = await Usuario.create({
      nombre,
      ci,
      correo,
      contraseña: hashedPassword,
      rolId,
      unidadId,
    });
    res.status(201).json({
      ok: true,
      mensaje: "Usuario creado correctamente",
      datos: { ...nuevoUsuario.toJSON(), contraseña: undefined },
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al crear usuario", error });
  }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ ok: false, mensaje: "No autorizado" });
  try {
    const { id } = req.params;
    const { nombre, ci, correo, contraseña, rolId, unidadId } = req.body;
    const usuario = await Usuario.findByPk(id);
    if (!usuario)
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });

    let updateData = { nombre, ci, correo, rolId, unidadId };
    if (contraseña) updateData.contraseña = await bcrypt.hash(contraseña, 10);

    await usuario.update(updateData);
    res.json({
      ok: true,
      mensaje: "Usuario actualizado correctamente",
      datos: { ...usuario.toJSON(), contraseña: undefined },
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al actualizar usuario", error });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ ok: false, mensaje: "No autorizado" });
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario)
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });

    await usuario.destroy();
    res.json({ ok: true, mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al eliminar usuario", error });
  }
};
