'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Admin',
        ci: '12345678',
        correo: 'admin@demo.com',
        contraseña: await bcrypt.hash('admin123', 10),
        rolId: 1,
        unidadId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Supervisor',
        ci: '23456789',
        correo: 'supervisor@demo.com',
        contraseña: await bcrypt.hash('supervisor123', 10),
        rolId: 2,
        unidadId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Operador',
        ci: '34567890',
        correo: 'operador@demo.com',
        contraseña: await bcrypt.hash('operador123', 10),
        rolId: 3,
        unidadId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Visualizador',
        ci: '45678901',
        correo: 'visualizador@demo.com',
        contraseña: await bcrypt.hash('visual123', 10),
        rolId: 4,
        unidadId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
