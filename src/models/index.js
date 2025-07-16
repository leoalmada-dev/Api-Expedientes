const sequelize = require('../config/database');
const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Unidad = require('./Unidad');
const Expediente = require('./Expediente');
const Movimiento = require('./Movimiento');
const LogEliminacion = require('./LogEliminacion');

// Relaciones
Usuario.belongsTo(Rol, { foreignKey: 'rolId' });
Rol.hasMany(Usuario, { foreignKey: 'rolId' });

Unidad.hasMany(Expediente, { foreignKey: 'unidadId' });
Expediente.belongsTo(Unidad, { foreignKey: 'unidadId' });
Expediente.belongsTo(Usuario, { foreignKey: 'creadoPorId', as: 'creador' });

Expediente.hasMany(Movimiento, { foreignKey: 'expedienteId' });
Movimiento.belongsTo(Expediente, { foreignKey: 'expedienteId' });

Movimiento.belongsTo(Unidad, { foreignKey: 'unidadDestinoId', as: 'unidadDestino' });
Movimiento.belongsTo(Unidad, { foreignKey: 'unidadOrigenId', as: 'unidadOrigen' });
Movimiento.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });



module.exports = {
  sequelize,
  Rol,
  Usuario,
  Unidad,
  Expediente,
  Movimiento,
  LogEliminacion,
};
