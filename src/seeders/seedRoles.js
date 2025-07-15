const { Rol } = require('../models');

module.exports = async function seedRoles() {
  await Rol.bulkCreate([
    { nombre: 'admin' },
    { nombre: 'supervisor' },
    { nombre: 'operador' },
    { nombre: 'visualizador' }
  ], { ignoreDuplicates: true });
  console.log('✔ Roles precargados');
};
