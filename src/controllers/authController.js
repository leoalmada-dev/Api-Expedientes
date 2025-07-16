const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../models");

// Login de usuario por CI
exports.login = async (req, res) => {
  console.log("---------------------------------");
  console.log("Método:", req.method);
  console.log("Endpoint:", req.originalUrl);
  console.log("Headers:", req.headers);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  console.log("---------------------------------");
  try {
    const { usuario, contraseña } = req.body; // usuario = CI

    // Buscá el usuario e incluí el rol asociado
    const usuarioEncontrado = await Usuario.findOne({
      where: { ci: usuario },
      include: {
        model: Rol,
        attributes: ["id", "nombre"],
      },
    });

    if (!usuarioEncontrado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const contraseñaValida = await bcrypt.compare(
      contraseña,
      usuarioEncontrado.contraseña
    );
    if (!contraseñaValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Incluí el nombre y el id del rol en el token
    const token = jwt.sign(
      { id: usuarioEncontrado.id, rol: usuarioEncontrado.Rol.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Devolvé el token y los datos básicos del usuario y rol
    res.json({
      token,
      usuario: {
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
    res.status(500).json({ error: "Error interno en login" });
  }
};

// Registro de usuario por CI
exports.register = async (req, res) => {
  try {
    const { nombre, ci, correo, contraseña, rolId, unidadId } = req.body;

    // Validar que el CI no esté ya en uso
    const existente = await Usuario.findOne({ where: { ci } });
    if (existente) {
      return res
        .status(409)
        .json({ error: "El número de CI ya está registrado" });
    }

    // Validar CI (8 dígitos numéricos)
    if (!/^[0-9]{8}$/.test(ci)) {
      return res
        .status(400)
        .json({ error: "El CI debe contener exactamente 8 dígitos numéricos" });
    }

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
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        ci: nuevoUsuario.ci,
        correo: nuevoUsuario.correo,
        rolId: nuevoUsuario.rolId,
        unidadId: nuevoUsuario.unidadId,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};
