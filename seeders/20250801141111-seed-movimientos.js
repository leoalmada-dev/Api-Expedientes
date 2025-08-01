'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('movimientos', [
      {
        expedienteId: 1,
        tipo: "entrada",
        fecha_movimiento: "2025-07-01",
        unidadDestinoId: 1,
        unidadOrigenId: null,
        usuarioId: 1,
        observaciones: "Ingreso inicial",
        eliminado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        expedienteId: 1,
        tipo: "salida",
        fecha_movimiento: "2025-07-02",
        unidadDestinoId: 2,
        unidadOrigenId: 1,
        usuarioId: 1,
        observaciones: "Enviado a Jurídica",
        eliminado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        expedienteId: 2,
        tipo: "entrada",
        fecha_movimiento: "2025-07-05",
        unidadDestinoId: 1,
        unidadOrigenId: null,
        usuarioId: 2,
        observaciones: "Ingreso por ciudadano",
        eliminado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('movimientos', null, {});
  }
};
