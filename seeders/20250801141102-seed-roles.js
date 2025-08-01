"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("roles", [
      { nombre: "admin", createdAt: new Date(), updatedAt: new Date() },
      { nombre: "supervisor", createdAt: new Date(), updatedAt: new Date() },
      { nombre: "operador", createdAt: new Date(), updatedAt: new Date() },
      { nombre: "visualizador", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina solo los roles precargados
    await queryInterface.bulkDelete("roles", {
      nombre: ["admin", "supervisor", "operador", "visualizador"],
    });
  },
};
