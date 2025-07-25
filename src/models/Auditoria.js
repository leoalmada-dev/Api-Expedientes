'use strict';
module.exports = (sequelize, DataTypes) => {
  const Auditoria = sequelize.define('Auditoria', {
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entidad: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entidad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accion: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creado_en: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    tableName: 'auditorias',
    timestamps: false,
  });

  Auditoria.associate = function(models) {
    Auditoria.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario',
    });
  };

  return Auditoria;
};
