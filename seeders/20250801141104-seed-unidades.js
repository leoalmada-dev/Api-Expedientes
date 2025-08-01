'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('unidades', [
      {
        nombre: 'Secretaría General',
        tipo: 'interno',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Jurídica',
        tipo: 'interno',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Archivo',
        tipo: 'interno',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Unidad Externa',
        tipo: 'externo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('unidades', null, {});
  },
};
