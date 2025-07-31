const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LoginIntento = sequelize.define("LoginIntento", {
  usuario: { // Puede ser el CI, email, o null si no existe
    type: DataTypes.STRING,
    allowNull: true,
  },
  exito: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: "login_intentos",
  timestamps: true, // createdAt = fecha intento
});

module.exports = LoginIntento;
