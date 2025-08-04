'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('unidades', 'tipo_institucion', {
      type: Sequelize.STRING(80),
      allowNull: false,
      defaultValue: 'dependencia',
      after: 'tipo' // Opcional, solo para MySQL
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('unidades', 'tipo_institucion');
  }
};
