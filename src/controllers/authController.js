const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../models");

// Login de usuario por CI
exports.login = async (req, res) => {
  try {
    const { usuario, contraseña } = req.body; // usuario = CI

    // Buscar el usuario e incluir el rol asociado
    const usuarioEncontrado = await Usuario.findOne({
      where: { ci: usuario },
      include: { model: Rol }
    });

    if (!usuarioEncontrado) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado"
      });
    }

    if (!usuarioEncontrado.contraseña) {
      return res.status(500).json({
        ok: false,
        mensaje: "Usuario sin contraseña registrada. Contacte al administrador."
      });
    }

    const contraseñaValida = await bcrypt.compare(
      contraseña,
      usuarioEncontrado.contraseña
    );
    if (!contraseñaValida) {
      return res.status(401).json({
        ok: false,
        mensaje: "Contraseña incorrecta"
      });
    }

    // Incluí el nombre y el id del rol en el token
    const token = jwt.sign(
      { id: usuarioEncontrado.id, rol: usuarioEncontrado.Rol.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Devolvé el token y los datos básicos del usuario y rol
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
    console.error("Error en login:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno en login", error });
  }
};
