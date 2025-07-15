const { Rol } = require('../models');

async function seedRoles() {
  await Rol.bulkCreate([
    { nombre: 'admin' },
    { nombre: 'operador' },
    { nombre: 'usuario' }
  ], { ignoreDuplicates: true });

  console.log('✔ Roles precargados');
  process.exit();
}

seedRoles();
