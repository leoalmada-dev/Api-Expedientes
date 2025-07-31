const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unidad = sequelize.define('Unidad', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    // defaultValue: 'interno',
    validate: {
      isIn: {
        args: [['interno', 'externo']],
        msg: 'El tipo debe ser "interno" o "externo"',
      },
    },
  }
}, {
  tableName: 'unidades'
});

module.exports = Unidad;
