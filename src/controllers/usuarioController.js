const { Usuario, Rol, Unidad } = require("../models");
const bcrypt = require("bcryptjs");

// Listar usuarios
exports.listarUsuarios = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ error: "No autorizado" });
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["contraseña"] },
      include: [
        { model: Rol, attributes: ["nombre"] },
        { model: Unidad, attributes: ["nombre"] },
      ],
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error al listar usuarios:", error); // <--- AGREGÁ ESTO
    res.status(500).json({ error: "Error al listar usuarios" });
  }
};

// Crear usuario
exports.crearUsuario = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ error: "No autorizado" });
  try {
    const { nombre, ci, correo, contraseña, rolId, unidadId } = req.body;
    const existe = await Usuario.findOne({ where: { ci } });
    if (existe) return res.status(409).json({ error: "CI ya registrado" });

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = await Usuario.create({
      nombre,
      ci,
      correo,
      contraseña: hashedPassword,
      rolId,
      unidadId,
    });
    res
      .status(201)
      .json({
        mensaje: "Usuario creado",
        usuario: { ...nuevoUsuario.toJSON(), contraseña: undefined },
      });
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ error: "No autorizado" });
  try {
    const { id } = req.params;
    const { nombre, ci, correo, contraseña, rolId, unidadId } = req.body;
    const usuario = await Usuario.findByPk(id);
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    let updateData = { nombre, ci, correo, rolId, unidadId };
    if (contraseña) updateData.contraseña = await bcrypt.hash(contraseña, 10);

    await usuario.update(updateData);
    res.json({
      mensaje: "Usuario actualizado",
      usuario: { ...usuario.toJSON(), contraseña: undefined },
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  if (req.user.rol !== "admin" && req.user.rol !== "supervisor")
    return res.status(403).json({ error: "No autorizado" });
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    await usuario.destroy();
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
