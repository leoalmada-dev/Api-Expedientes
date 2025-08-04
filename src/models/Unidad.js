const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Unidad = sequelize.define(
  "Unidad",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [["interno", "externo"]],
          msg: 'El tipo debe ser "interno" o "externo"',
        },
      },
    },
    tipo_institucion: {
      type: DataTypes.STRING(80), // Campo abierto, hasta 80 caracteres
      allowNull: false,
      defaultValue: "dependencia",
      // Si querés podés agregar una validación de largo
      validate: {
        len: {
          args: [3, 80],
          msg: "El tipo de institución debe tener entre 3 y 80 caracteres",
        },
      },
    },
  },
  {
    tableName: "unidades",
  }
);

module.exports = Unidad;
