'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('movimientos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      expedienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'expedientes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      tipo: { type: Sequelize.STRING(10), allowNull: false }, // "entrada" o "salida"
      fecha_movimiento: { type: Sequelize.DATEONLY, allowNull: false },
      unidadDestinoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'unidades', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      unidadOrigenId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'unidades', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      observaciones: { type: Sequelize.STRING(250) },
      eliminado: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('movimientos');
  },
};
