"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("expedientes", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      tipo_documento: { type: Sequelize.STRING(20), allowNull: false },
      numero_documento: { type: Sequelize.STRING(50), allowNull: false },
      forma_ingreso: { type: Sequelize.STRING(20), allowNull: false },
      fecha_ingreso: { type: Sequelize.DATEONLY, allowNull: false },
      referencia: { type: Sequelize.STRING(100) },
      detalle: { type: Sequelize.TEXT },
      urgencia: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "comun",
      }, // "comun" o "urgente"
      estado: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "abierto",
      }, // "abierto" o "cerrado"
      creadoPorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "usuarios", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      cerradoPorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "usuarios", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      fecha_cierre: { type: Sequelize.DATE },
      eliminado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fecha_registro_sistema: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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
    await queryInterface.dropTable("expedientes");
  },
};
