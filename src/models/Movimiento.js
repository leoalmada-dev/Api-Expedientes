const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movimiento = sequelize.define('Movimiento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  expedienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING, // 'entrada', 'salida', 'archivo', etc.
    allowNull: false
  },
  fecha_movimiento: {
    type: DataTypes.DATEONLY, // Fecha real del movimiento/documento
    allowNull: false
  },
  unidadDestinoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unidadOrigenId: {
    type: DataTypes.INTEGER,
    allowNull: true // Puede ser null si es generado en la oficina
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'movimientos'
});

module.exports = Movimiento;
