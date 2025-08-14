// src/test/jest.teardown.js
module.exports = async () => {
  const { sequelize } = require("../models");
  if (sequelize?.close) {
    await sequelize.close();
  }
};
