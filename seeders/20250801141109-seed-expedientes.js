'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('expedientes', [
      {
        tipo_documento: "oficio",
        numero_documento: "100/2025",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-01",
        referencia: "demanda",
        detalle: "Reclamo de pago expediente 123",
        creadoPorId: 1,
        estado: "abierto",
        cerradoPorId: null,
        fecha_cierre: null,
        eliminado: false,
        urgencia: "comun",           // si usás el campo
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo_documento: "fisico",
        numero_documento: "2025-4-1-0000967",
        forma_ingreso: "papel",
        fecha_ingreso: "2025-07-05",
        referencia: "solicitud",
        detalle: "Solicitud de constancia",
        creadoPorId: 2,
        estado: "abierto",
        cerradoPorId: null,
        fecha_cierre: null,
        eliminado: false,
        urgencia: "urgente",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('expedientes', null, {});
  }
};
