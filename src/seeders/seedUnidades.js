const { Unidad } = require('../models');

module.exports = async function seedUnidades() {
  await Unidad.bulkCreate([
    { nombre: 'Secretaría General' },
    { nombre: 'Jurídica' },
    { nombre: 'Archivo' },
    { nombre: 'Externo' }
  ], { ignoreDuplicates: true });
  console.log('✔ Unidades precargadas');
};
