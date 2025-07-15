const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = async function seedUsuarios() {
  await Usuario.bulkCreate([
    {
      nombre: 'admin',
      correo: 'admin@demo.com',
      contraseña: await bcrypt.hash('admin123', 10),
      rolId: 1,
      unidadId: 1
    },
    {
      nombre: 'supervisor',
      correo: 'supervisor@demo.com',
      contraseña: await bcrypt.hash('supervisor123', 10),
      rolId: 2,
      unidadId: 1
    },
    {
      nombre: 'operador',
      correo: 'operador@demo.com',
      contraseña: await bcrypt.hash('operador123', 10),
      rolId: 3,
      unidadId: 1
    },
    {
      nombre: 'visualizador',
      correo: 'visualizador@demo.com',
      contraseña: await bcrypt.hash('visual123', 10),
      rolId: 4,
      unidadId: 1
    }
  ], { ignoreDuplicates: true });
  console.log('✔ Usuarios precargados');
};
