require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./models');

async function crearUsuarioInicial() {
  try {
    await db.sequelize.sync({ force: true });

    const rolAdmin = await db.Rol.create({
      nombre: 'admin',
      descripcion: 'Administrador del sistema'
    });

    const passwordHasheada = await bcrypt.hash('admin123', 10);

    const usuario = await db.Usuario.create({
      nombre: 'Administrador',
      email: 'admin@example.com',
      password: passwordHasheada,
      rol_id: rolAdmin.id
    });

    console.log('🟢 Usuario admin creado con éxito:', usuario.email);
    process.exit();
  } catch (error) {
    console.error('🔴 Error al crear usuario inicial:', error);
    process.exit(1);
  }
}

crearUsuarioInicial();
