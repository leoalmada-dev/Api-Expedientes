// src/seeders/seedUnidades.js
const { Unidad } = require('../models');

async function seedUnidades() {
  try {
    const unidades = [
      { nombre: 'Unidad 1' },
      { nombre: 'Unidad 2' },
      { nombre: 'Unidad 3' }
    ];
    for (const unidad of unidades) {
      await Unidad.findOrCreate({ where: { nombre: unidad.nombre } });
    }
    console.log('✔ Unidades precargadas');
  } catch (error) {
    console.error('Error al precargar unidades:', error);
  }
}

seedUnidades();