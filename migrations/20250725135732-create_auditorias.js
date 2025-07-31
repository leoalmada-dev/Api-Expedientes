'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auditorias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      entidad: {
        type: Sequelize.STRING(50), // Ej: 'unidad', 'usuario'
        allowNull: false,
      },
      entidad_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      accion: {
        type: Sequelize.STRING(20), // Ej: 'actualizar', 'eliminar'
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT, // Puede incluir cambios o motivo
        allowNull: true,
      },
      creado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auditorias');
  },
};
