const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rol = require('./Rol');
const Unidad = require('./Unidad');

const Usuario = sequelize.define('Usuario', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ci: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[0-9]{8}$/, // Solo acepta 8 dígitos numéricos
    },
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: true, // Puede ser null, ya que el login es por CI
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rol,
      key: 'id',
    },
  },
  unidadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Unidad,
      key: 'id',
    },
  },
}, {
  tableName: 'usuarios'
});

module.exports = Usuario;
