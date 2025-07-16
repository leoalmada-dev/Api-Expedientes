const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogEliminacion = sequelize.define('LogEliminacion', {
  expedienteId: { type: DataTypes.INTEGER, allowNull: false },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'log_eliminaciones',
  timestamps: false
});

module.exports = LogEliminacion;
