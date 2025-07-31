const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Unidad = require('./Unidad');
const Expediente = require('./Expediente');
const Movimiento = require('./Movimiento');
const LogEliminacion = require('./LogEliminacion');
const Auditoria = require('./auditoria')(sequelize, DataTypes);  // <-- Asegúrate que el archivo se llama igual
const LoginIntento = require("./LoginIntento");

// Relaciones
Usuario.belongsTo(Rol, { foreignKey: 'rolId' });
Rol.hasMany(Usuario, { foreignKey: 'rolId' });

Expediente.belongsTo(Usuario, { foreignKey: 'creadoPorId', as: 'creador' });

Expediente.hasMany(Movimiento, { foreignKey: 'expedienteId' });
Movimiento.belongsTo(Expediente, { foreignKey: 'expedienteId' });

Movimiento.belongsTo(Unidad, { foreignKey: 'unidadDestinoId', as: 'unidadDestino' });
Movimiento.belongsTo(Unidad, { foreignKey: 'unidadOrigenId', as: 'unidadOrigen' });
Movimiento.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Usuario.belongsTo(Unidad, { foreignKey: 'unidadId' });
Unidad.hasMany(Usuario, { foreignKey: 'unidadId' });

// Exports (importante incluir Auditoria aquí)
module.exports = {
  sequelize,
  Rol,
  Usuario,
  Unidad,
  Expediente,
  Movimiento,
  LogEliminacion,
  Auditoria, // 👈 AGREGA esto al export!
  LoginIntento
};
