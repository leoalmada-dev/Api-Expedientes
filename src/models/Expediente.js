const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Expediente = sequelize.define(
  "Expediente",
  {
    // id es autoincremental y primaryKey por defecto
    tipo_documento: { type: DataTypes.STRING, allowNull: false },
    numero_documento: { type: DataTypes.STRING, allowNull: false },
    forma_ingreso: { type: DataTypes.STRING, allowNull: false },
    fecha_ingreso: { type: DataTypes.DATEONLY, allowNull: false },
    procedencia: { type: DataTypes.STRING, allowNull: false },
    dependencia_origen: { type: DataTypes.STRING },
    referencia: { type: DataTypes.STRING },
    detalle: { type: DataTypes.TEXT },
    fecha_registro_sistema: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    creadoPorId: { type: DataTypes.INTEGER, allowNull: false },
    estado: {
      type: DataTypes.STRING,
      defaultValue: "abierto",
    },
    cerradoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    eliminado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "expedientes",
  }
);

module.exports = Expediente;
