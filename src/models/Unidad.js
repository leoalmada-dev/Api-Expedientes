const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unidad = sequelize.define('Unidad', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'unidades' // <- Nombre correcto en plural español
});


module.exports = Unidad;
