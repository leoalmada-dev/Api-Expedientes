const { Expediente, Movimiento, Unidad, Usuario } = require("../models");
const { Op } = require("sequelize");

exports.reporteUsuarios = async (req, res) => {
  res.json({ ok: true, msg: "Usuarios" });
};

// controllers/reportesController.js
exports.reporteExpedientes = async (req, res) => {
  try {
    let {
      fecha_desde,
      fecha_hasta,
      tipo_destino,
      tipo_documento,
      referencia,
      urgencia,
      plazo,
      rango,
    } = req.query;
    const where = { eliminado: false };

    // Rango rápido: hoy, semana, mes
    if (rango && !fecha_desde && !fecha_hasta) {
      const now = new Date();
      if (rango === "hoy") {
        fecha_desde = fecha_hasta = now.toISOString().slice(0, 10);
      } else if (rango === "semana") {
        const primerDiaSemana = new Date(now);
        primerDiaSemana.setDate(
          now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)
        ); // lunes
        fecha_desde = primerDiaSemana.toISOString().slice(0, 10);
        fecha_hasta = now.toISOString().slice(0, 10);
      } else if (rango === "mes") {
        const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
        fecha_desde = primerDiaMes.toISOString().slice(0, 10);
        fecha_hasta = now.toISOString().slice(0, 10);
      }
    }

    // Filtros de fechas
    if (fecha_desde && fecha_hasta) {
      where.fecha_ingreso = { [Op.between]: [fecha_desde, fecha_hasta] };
    } else if (fecha_desde) {
      where.fecha_ingreso = { [Op.gte]: fecha_desde };
    } else if (fecha_hasta) {
      where.fecha_ingreso = { [Op.lte]: fecha_hasta };
    }
    if (tipo_documento) where.tipo_documento = tipo_documento;
    if (urgencia) where.urgencia = urgencia;
    if (referencia) where.referencia = { [Op.like]: `%${referencia}%` };

    // Busca expedientes y movimientos
    let expedientes = await Expediente.findAll({
      where,
      include: [
        {
          model: Movimiento,
          as: "Movimientos",
          required: false,
          include: [
            {
              model: Unidad,
              as: "unidadDestino",
              attributes: ["id", "nombre", "tipo", "tipo_institucion"],
            },
          ],
        },
      ],
    });

    // Procesar plazos y filtro por destino
    const hoy = new Date();
    expedientes = expedientes.map((exp) => {
      const movs = exp.movimientos || [];
      // Último movimiento "salida" como cierre
      const movCierre = movs
        .filter((m) => m.tipo === "salida")
        .sort(
          (a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento)
        )[0];

      // 👇 Usamos exp.fecha_cierre si existe, si no el último movimiento
      const fechaCierre =
        exp.fecha_cierre ||
        (movCierre ? movCierre.fecha_movimiento : null);

      const estado = exp.estado;
      const fechaIngreso = new Date(exp.fecha_ingreso);

      // Plazo según urgencia
      const diasPermitidos = exp.urgencia === "urgente" ? 2 : 5;

      let plazoCumplido = null; // default: en curso

      if (estado === "cerrado" && fechaCierre) {
        const dias = Math.ceil(
          (new Date(fechaCierre) - fechaIngreso) / (1000 * 60 * 60 * 24)
        );
        plazoCumplido = dias <= diasPermitidos;
      } else if (estado === "abierto") {
        const diasTranscurridos = Math.ceil(
          (hoy - fechaIngreso) / (1000 * 60 * 60 * 24)
        );
        // Solo marcamos incumplido si YA pasó el plazo, sino null ("en plazo")
        if (diasTranscurridos > diasPermitidos) {
          plazoCumplido = false;
        } else {
          plazoCumplido = null; // Aún está dentro del plazo
        }
      }

      // Filtro de tipo_destino
      let destino = null;
      if (movCierre && movCierre.unidadDestino) {
        destino = movCierre.unidadDestino;
      }

      return {
        id: exp.id,
        tipo_documento: exp.tipo_documento,
        fecha_ingreso: exp.fecha_ingreso,
        estado: exp.estado,
        fecha_cierre: fechaCierre, // <-- Siempre informada si existe!
        urgencia: exp.urgencia,
        plazo_cumplido: plazoCumplido,
        destino: destino
          ? { tipo: destino.tipo, nombre: destino.nombre }
          : null,
      };
    });

    // Filtro por tipo_destino (si corresponde)
    if (tipo_destino && tipo_destino !== "todos") {
      expedientes = expedientes.filter(
        (exp) => exp.destino && exp.destino.tipo === tipo_destino
      );
    }

    // Filtro por plazo
    if (plazo) {
      expedientes = expedientes.filter((exp) =>
        plazo === "cumplido"
          ? exp.plazo_cumplido === true
          : exp.plazo_cumplido === false
      );
    }

    // Resumen
    const resumen = {
      total: expedientes.length,
      cumplieron_plazo: expedientes.filter(
        (e) => e.estado === "cerrado" && e.plazo_cumplido === true
      ).length,
      incumplieron_plazo: expedientes.filter(
        (e) =>
          (e.estado === "cerrado" && e.plazo_cumplido === false) ||
          (e.estado === "abierto" && e.plazo_cumplido === false)
      ).length,
      en_plazo: expedientes.filter(
        (e) => e.estado === "abierto" && e.plazo_cumplido === null
      ).length,
      cerrados_fuera_plazo: expedientes.filter(
        (e) => e.estado === "cerrado" && e.plazo_cumplido === false
      ).length,
    };

    // DEVOLVER también los filtros aplicados (útil para front/debug)
    res.json({
      ok: true,
      mensaje: "Reporte generado correctamente",
      filtros: {
        fecha_desde,
        fecha_hasta,
        tipo_destino,
        tipo_documento,
        urgencia,
        plazo,
        referencia,
        rango,
      },
      datos: { resumen, expedientes },
    });
  } catch (error) {
    console.error("Error en reporteExpedientes:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error generando reporte", error });
  }
};
