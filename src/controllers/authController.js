const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../models");
const registrarLoginIntento = require("../helpers/registrarLoginIntento"); // <--- NUEVO

// Login de usuario por CI
exports.login = async (req, res) => {
  try {
    const { usuario, contraseña } = req.body; // usuario = CI

    // Buscar el usuario e incluir el rol asociado
    const usuarioEncontrado = await Usuario.findOne({
      where: { ci: usuario },
      include: { model: Rol },
    });

    if (!usuarioEncontrado) {
      await registrarLoginIntento({
        usuario,
        exito: false,
        motivo: "Usuario no encontrado",
        ip: req.ip,
      });
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    if (!usuarioEncontrado.contraseña) {
      await registrarLoginIntento({
        usuario,
        exito: false,
        motivo: "Usuario sin contraseña registrada",
        ip: req.ip,
      });
      return res.status(500).json({
        ok: false,
        mensaje: "Usuario sin contraseña registrada. Contacte al administrador.",
      });
    }

    const contraseñaValida = await bcrypt.compare(
      contraseña,
      usuarioEncontrado.contraseña
    );

    if (!contraseñaValida) {
      await registrarLoginIntento({
        usuario,
        exito: false,
        motivo: "Contraseña incorrecta",
        ip: req.ip,
      });
      return res.status(401).json({
        ok: false,
        mensaje: "Contraseña incorrecta",
      });
    }

    // Login exitoso
    const token = jwt.sign(
      { id: usuarioEncontrado.id, rol: usuarioEncontrado.Rol.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await registrarLoginIntento({
      usuario,
      exito: true,
      motivo: "Login exitoso",
      ip: req.ip,
    });

    res.json({
      ok: true,
      mensaje: "Login exitoso",
      token,
      datos: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        ci: usuarioEncontrado.ci,
        correo: usuarioEncontrado.correo,
        rol: {
          id: usuarioEncontrado.Rol.id,
          nombre: usuarioEncontrado.Rol.nombre,
        },
        unidadId: usuarioEncontrado.unidadId,
      },
    });

  } catch (error) {
    await registrarLoginIntento({
      usuario: req.body.usuario || null,
      exito: false,
      motivo: "Error interno en login",
      ip: req.ip,
    });
    console.error("Error en login:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error interno en login", error });
  }
};
