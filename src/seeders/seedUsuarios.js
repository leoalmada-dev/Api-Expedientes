const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = async function seedUsuarios() {
  await Usuario.bulkCreate([
    {
      nombre: 'Admin',
      ci: '12345678',
      correo: 'admin@demo.com',
      contraseña: await bcrypt.hash('admin123', 10),
      rolId: 1,
      unidadId: 1
    },
    {
      nombre: 'Supervisora',
      ci: '23456789',
      correo: 'supervisor@demo.com',
      contraseña: await bcrypt.hash('supervisor123', 10),
      rolId: 2,
      unidadId: 1
    },
    {
      nombre: 'Operador',
      ci: '34567890',
      correo: 'operador@demo.com',
      contraseña: await bcrypt.hash('operador123', 10),
      rolId: 3,
      unidadId: 1
    },
    {
      nombre: 'Visualizador',
      ci: '45678901',
      correo: 'visualizador@demo.com',
      contraseña: await bcrypt.hash('visual123', 10),
      rolId: 4,
      unidadId: 1
    }
  ], { ignoreDuplicates: true });
  console.log('✔ Usuarios precargados');
};
