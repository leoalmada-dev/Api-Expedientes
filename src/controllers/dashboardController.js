const { Expediente, Movimiento, Usuario, LoginIntento } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

exports.dashboardStats = async (req, res) => {
  try {
    const rol = req.user.rol;

    // Fechas recientes
    const hoy = new Date();
    const hace7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const hoyStr = hoy.toISOString().slice(0, 10);
    const hace7Str = hace7.toISOString().slice(0, 10);

    // ---- TOTALES Y RECIENTES ----
    const [
      totalExpedientes,
      totalAbiertos,
      totalCerrados,
      totalMovimientos,
      expedientesHoy,
      expedientesSemana,
      movimientosHoy,
      movimientosSemana,
      urgentesAbiertos,
      comunesAbiertos,
      totalUsuarios,
      usuariosActivosSemana,
    ] = await Promise.all([
      Expediente.count({ where: { eliminado: false } }),
      Expediente.count({ where: { eliminado: false, estado: "abierto" } }),
      Expediente.count({ where: { eliminado: false, estado: "cerrado" } }),
      Movimiento.count({ where: { eliminado: false } }),
      Expediente.count({ where: { eliminado: false, fecha_ingreso: hoyStr } }),
      Expediente.count({
        where: { eliminado: false, fecha_ingreso: { [Op.gte]: hace7Str } },
      }),
      Movimiento.count({
        where: { eliminado: false, fecha_movimiento: hoyStr },
      }),

      Movimiento.count({
        where: { eliminado: false, fecha_movimiento: { [Op.gte]: hace7Str } },
      }),
      Expediente.count({
        where: {
          eliminado: false,
          estado: "abierto",
          urgencia: "urgente",
        },
      }),
      Expediente.count({
        where: {
          eliminado: false,
          estado: "abierto",
          urgencia: "comun",
        },
      }),
      Usuario.count(),
      LoginIntento.count({
        distinct: true,
        col: "usuario",
        where: {
          exito: true,
          createdAt: { [Op.gte]: hace7Str },
        },
      }),
    ]);

    // ==== PREPARAR RESPUESTA SEGÚN ROL ====
    let datos = {
      totales: {
        expedientes: totalExpedientes,
        expedientesAbiertos: totalAbiertos,
        movimientos: totalMovimientos,
      },
      recientes: {
        expedientesHoy,
        expedientesSemana,
        movimientosHoy,
        movimientosSemana,
      },
      alertas: {
        urgentesAbiertos,
        comunesAbiertos,
      },
    };

    if (["admin", "supervisor"].includes(rol)) {
      // Estadísticas por tipo de documento
      const porTipoDocumento = await Expediente.findAll({
        where: { eliminado: false },
        attributes: [
          "tipo_documento",
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        ],
        group: ["tipo_documento"],
        raw: true,
      });

      // Estadísticas por urgencia
      const porUrgencia = await Expediente.findAll({
        where: { eliminado: false },
        attributes: [
          "urgencia",
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        ],
        group: ["urgencia"],
        raw: true,
      });

      // Expedientes abiertos sin movimiento en la última semana
      const expAbiertos = await Expediente.findAll({
        where: { eliminado: false, estado: "abierto" },
        attributes: ["id"],
        raw: true,
      });
      let sinMovimientoSemana = 0;
      if (expAbiertos.length) {
        const ids = expAbiertos.map((e) => e.id);
        const recientes = await Movimiento.findAll({
          where: {
            expedienteId: { [Op.in]: ids },
            fecha_movimiento: { [Op.gte]: hace7Str },
            eliminado: false,
          },
          attributes: ["expedienteId"],
          group: ["expedienteId"],
          raw: true,
        });
        const idsConMovReciente = recientes.map((r) => r.expedienteId);
        sinMovimientoSemana = ids.filter(
          (id) => !idsConMovReciente.includes(id)
        ).length;
      }

      // Usuarios totales
      const totalUsuarios = await Usuario.count();

      // Usuarios activos esta semana (por logins)
      const usuariosActivosSemana = await LoginIntento.count({
        distinct: true,
        col: "usuario",
        where: {
          exito: true,
          createdAt: { [Op.gte]: hace7Str },
        },
      });

      // Usuarios inactivos esta semana
      const usuariosTotalesArr = await Usuario.findAll({
        attributes: ["ci"],
        raw: true,
      });
      const usuariosActivosArr = await LoginIntento.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("usuario")), "usuario"],
        ],
        where: {
          exito: true,
          createdAt: { [Op.gte]: hace7Str },
        },
        raw: true,
      });
      const activosCIs = usuariosActivosArr.map((u) => u.usuario);
      const usuariosInactivosSemana = usuariosTotalesArr.filter(
        (u) => !activosCIs.includes(u.ci)
      ).length;

      // Expedientes reabiertos (pasaron de cerrado a abierto, usando updatedAt)
      const expedientesReabiertos = await Expediente.count({
        where: {
          estado: "abierto",
          updatedAt: { [Op.gte]: hace7Str },
          eliminado: false,
        },
      });

      // Agregar al objeto datos:
      datos.totales.usuarios = totalUsuarios;
      datos.totales.usuariosActivosSemana = usuariosActivosSemana;
      datos.totales.usuariosInactivosSemana = usuariosInactivosSemana;
      datos.totales.expedientesCerrados = totalCerrados;
      datos.porTipoDocumento = porTipoDocumento;
      datos.porUrgencia = porUrgencia;
      datos.alertas.sinMovimientoSemana = sinMovimientoSemana;
      datos.alertas.expedientesReabiertos = expedientesReabiertos;
    }

    res.json({
      ok: true,
      mensaje: "Estadísticas del sistema",
      datos,
    });
  } catch (error) {
    console.error("Error en dashboard:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error al obtener estadísticas", error });
  }
};
