const {
  Expediente,
  Movimiento,
  Unidad,
  Usuario,
  Rol,
  LoginIntento,
  Auditoria,
} = require("../models");
const { Op, fn, col } = require("sequelize");

// GET /reportes/usuarios  (solo admin/supervisor por ruta/middleware)
exports.reporteUsuarios = async (req, res) => {
  try {
    const { rol, unidadId, buscar, activo } = req.query;
    // activo: "semana" (opcional) — filtra solo usuarios activos esta semana

    // Ventanas de tiempo
    const ahora = new Date();
    const hace7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Filtro base de usuarios
    const whereUsuarios = {};
    if (rol) whereUsuarios.rolId = rol; // id numérico del rol (o ajusta si envías slug)
    if (unidadId) whereUsuarios.unidadId = unidadId;
    if (buscar) {
      // búsqueda simple por nombre/correo/ci
      whereUsuarios[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
        { correo: { [Op.like]: `%${buscar}%` } },
        { ci: { [Op.like]: `%${buscar}%` } },
      ];
    }

    // Traemos usuarios con su Rol y Unidad
    const usuarios = await Usuario.findAll({
      where: whereUsuarios,
      attributes: [
        "id",
        "nombre",
        "correo",
        "ci",
        "rolId",
        "unidadId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        { model: Rol, attributes: ["id", "nombre"] },
        {
          model: Unidad,
          attributes: ["id", "nombre", "tipo", "tipo_institucion"],
        },
      ],
      order: [["id", "ASC"]],
    });

    if (usuarios.length === 0) {
      return res.json({
        ok: true,
        mensaje: "No se encontraron usuarios con los filtros aplicados",
        datos: {
          resumen: {
            total: 0,
            activosSemana: 0,
            inactivosSemana: 0,
            conIntentosFallidosSemana: 0,
          },
          usuarios: [],
        },
      });
    }

    // ===== Agregaciones en bloque (evitamos N+1) =====
    // Totales creados (histórico)
    const [expTotales, movTotales] = await Promise.all([
      Expediente.findAll({
        attributes: ["creadoPorId", [fn("COUNT", col("id")), "total"]],
        group: ["creadoPorId"],
        raw: true,
      }),
      Movimiento.findAll({
        attributes: ["usuarioId", [fn("COUNT", col("id")), "total"]],
        where: { eliminado: false },
        group: ["usuarioId"],
        raw: true,
      }),
    ]);

    // Actividad última semana (creaciones)
    const [expSemana, movSemana] = await Promise.all([
      Expediente.findAll({
        attributes: ["creadoPorId", [fn("COUNT", col("id")), "total"]],
        where: { createdAt: { [Op.gte]: hace7 } },
        group: ["creadoPorId"],
        raw: true,
      }),
      Movimiento.findAll({
        attributes: ["usuarioId", [fn("COUNT", col("id")), "total"]],
        where: { createdAt: { [Op.gte]: hace7 }, eliminado: false },
        group: ["usuarioId"],
        raw: true,
      }),
    ]);

    // Último login exitoso por usuario (LoginIntento.usuario = CI del Usuario)
    const lastLoginOk = await LoginIntento.findAll({
      attributes: ["usuario", [fn("MAX", col("createdAt")), "ultimoLogin"]],
      where: { exito: true },
      group: ["usuario"],
      raw: true,
    });

    // Logins semana (éxitos/fallos) para métricas de supervisión
    const [loginOkSemana, loginFailSemana] = await Promise.all([
      LoginIntento.findAll({
        attributes: ["usuario", [fn("COUNT", col("id")), "okSemana"]],
        where: { exito: true, createdAt: { [Op.gte]: hace7 } },
        group: ["usuario"],
        raw: true,
      }),
      LoginIntento.findAll({
        attributes: ["usuario", [fn("COUNT", col("id")), "fallosSemana"]],
        where: { exito: false, createdAt: { [Op.gte]: hace7 } },
        group: ["usuario"],
        raw: true,
      }),
    ]);

    // Última actividad (máximo createdAt entre expedientes y movimientos) por usuario
    const [expUltAct, movUltAct] = await Promise.all([
      Expediente.findAll({
        attributes: ["creadoPorId", [fn("MAX", col("createdAt")), "ultimaExp"]],
        group: ["creadoPorId"],
        raw: true,
      }),
      Movimiento.findAll({
        attributes: ["usuarioId", [fn("MAX", col("createdAt")), "ultimoMov"]],
        where: { eliminado: false },
        group: ["usuarioId"],
        raw: true,
      }),
    ]);

    // Helpers para mapear resultados rápidos
    const indexBy = (arr, keyField) =>
      arr.reduce((acc, row) => {
        acc[row[keyField]] = row;
        return acc;
      }, {});

    const expTotByUser = indexBy(expTotales, "creadoPorId");
    const movTotByUser = indexBy(movTotales, "usuarioId");
    const expSemByUser = indexBy(expSemana, "creadoPorId");
    const movSemByUser = indexBy(movSemana, "usuarioId");

    const lastLoginByCi = indexBy(lastLoginOk, "usuario");
    const okSemanaByCi = indexBy(loginOkSemana, "usuario");
    const failSemanaByCi = indexBy(loginFailSemana, "usuario");

    const expUltActByUser = indexBy(expUltAct, "creadoPorId");
    const movUltActByUser = indexBy(movUltAct, "usuarioId");

    const filas = usuarios.map((u) => {
      const totalExpedientes = Number(expTotByUser[u.id]?.total || 0);
      const totalMovimientos = Number(movTotByUser[u.id]?.total || 0);

      const expedientesSemana = Number(expSemByUser[u.id]?.total || 0);
      const movimientosSemana = Number(movSemByUser[u.id]?.total || 0);

      const ultimoLogin = lastLoginByCi[u.ci]?.ultimoLogin || null;
      const loginsOkSemana = Number(okSemanaByCi[u.ci]?.okSemana || 0);
      const loginsFallosSemana = Number(
        failSemanaByCi[u.ci]?.fallosSemana || 0
      );

      const ultimaExp = expUltActByUser[u.id]?.ultimaExp
        ? new Date(expUltActByUser[u.id].ultimaExp)
        : null;
      const ultimoMov = movUltActByUser[u.id]?.ultimoMov
        ? new Date(movUltActByUser[u.id].ultimoMov)
        : null;
      const ultimoLoginDate = ultimoLogin ? new Date(ultimoLogin) : null;

      // Última actividad: el máximo entre sus 3 fuentes
      const ultimaActividad =
        [ultimaExp, ultimoMov, ultimoLoginDate]
          .filter(Boolean)
          .sort((a, b) => b - a)[0] || null;

      const activoEstaSemana =
        expedientesSemana > 0 || movimientosSemana > 0 || loginsOkSemana > 0;

      return {
        id: u.id,
        nombre: u.nombre,
        correo: u.correo,
        ci: u.ci,
        rol: u.Rol ? u.Rol.nombre : null,
        unidad: u.Unidad
          ? {
              id: u.Unidad.id,
              nombre: u.Unidad.nombre,
              tipo: u.Unidad.tipo,
              tipo_institucion: u.Unidad.tipo_institucion,
            }
          : null,

        // Totales históricos
        total_expedientes_creados: totalExpedientes,
        total_movimientos_realizados: totalMovimientos,

        // Actividad última semana
        expedientes_semana: expedientesSemana,
        movimientos_semana: movimientosSemana,
        logins_ok_semana: loginsOkSemana,
        logins_fallidos_semana: loginsFallosSemana,

        // Trazabilidad / supervisión
        ultimo_login: ultimoLogin, // ISO string o null
        ultima_actividad: ultimaActividad
          ? ultimaActividad.toISOString()
          : null,
        activo_semana: activoEstaSemana, // boolean
        creado_en: u.createdAt,
        actualizado_en: u.updatedAt,
      };
    });

    // Filtro "activo=semana" (opcional) y resumen recalculado post-filtro
    const base =
      activo === "semana" ? filas.filter((f) => f.activo_semana) : filas;
    const resumen = {
      total: base.length,
      activosSemana: base.filter((f) => f.activo_semana).length,
      inactivosSemana: base.filter((f) => !f.activo_semana).length,
      conIntentosFallidosSemana: base.filter(
        (f) => f.logins_fallidos_semana > 0
      ).length,
    };

    res.json({
      ok: true,
      mensaje: "Reporte de usuarios",
      filtros: { rol, unidadId, buscar, activo },
      datos: { resumen, usuarios: base },
    });
  } catch (error) {
    console.error("Error en reporteUsuarios:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error generando reporte de usuarios",
      error,
    });
  }
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
      limit = 100,
      page = 1,
      orderBy = "fecha_ingreso",
      orderDir = "DESC",
    } = req.query;
    const where = { eliminado: false };

    // Normalización paginación/orden
    limit = Math.min(Number(limit) || 100, 200);
    page = Number(page) || 1;
    const offset = (page - 1) * limit;
    orderDir = orderDir === "ASC" ? "ASC" : "DESC";
    // Campos permitidos para ordenar (deben existir en el modelo)
    const orderAllow = new Set([
      "fecha_ingreso",
      "fecha_cierre",
      "urgencia",
      "estado",
      "id",
    ]);
    if (!orderAllow.has(orderBy)) orderBy = "fecha_ingreso";

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

    // Busca expedientes y movimientos (alias consistente: "Movimientos")
    const expedientesDb = await Expediente.findAll({
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
      attributes: [
        "id",
        "tipo_documento",
        "fecha_ingreso",
        "estado",
        "fecha_cierre",
        "urgencia",
      ],
      order: [
        [orderBy, orderDir],
        ["id", "DESC"],
      ],
      limit,
      offset,
    });

    // Procesar plazos y filtro por destino
    const hoy = new Date();
    let expedientes = expedientesDb.map((exp) => {
      const movs = exp.Movimientos || [];
      // Último movimiento "salida" como cierre
      const movCierre = movs
        .filter((m) => m.tipo === "salida")
        .sort(
          (a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento)
        )[0];

      // 👇 Usamos exp.fecha_cierre si existe, si no el último movimiento
      const fechaCierre =
        exp.fecha_cierre || (movCierre ? movCierre.fecha_movimiento : null);

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
      const plazoVencido = (plazoCumplido === false);

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
        plazo_vencido: plazoVencido,
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
        limit,
        page,
        orderBy,
        orderDir,
      },
      meta: { page, limit, returned: expedientes.length },
      datos: { resumen, expedientes },
    });
  } catch (error) {
    console.error("Error en reporteExpedientes:", error);
    res
      .status(500)
      .json({ ok: false, mensaje: "Error generando reporte", error });
  }
};

// GET /reportes/usuarios/:usuarioId/actividad
// Permisos sugeridos: admin/supervisor ven a cualquiera; un usuario puede ver su propia actividad.
exports.actividadDeUsuario = async (req, res) => {
  try {
    const solicitante = req.user; // { id, rol, ... }
    const { usuarioId } = req.params;

    // Permisos básicos
    const esSupervisor = ["admin", "supervisor"].includes(solicitante.rol);
    const esMismoUsuario = Number(usuarioId) === Number(solicitante.id);
    if (!esSupervisor && !esMismoUsuario) {
      return res.status(403).json({ ok: false, mensaje: "No autorizado" });
    }

    // Filtros
    let {
      desde,
      hasta,
      rango,
      incluir = "creados,movimientos,auditoria",
      limit = 100,
      offset = 0,
    } = req.query;
    limit = Math.min(Number(limit) || 50, 200);
    offset = Number(offset) || 0;

    // Resolver rango rápido si no hay desde/hasta
    if (!desde && !hasta && rango) {
      const hoy = new Date();
      if (rango === "hoy") {
        desde = hasta = hoy.toISOString().slice(0, 10);
      } else if (rango === "semana") {
        const lunes = new Date(hoy);
        lunes.setDate(
          hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1)
        );
        desde = lunes.toISOString().slice(0, 10);
        hasta = hoy.toISOString().slice(0, 10);
      } else if (rango === "mes") {
        const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        desde = primero.toISOString().slice(0, 10);
        hasta = hoy.toISOString().slice(0, 10);
      }
    }

    // WHERE helpers por fecha
    const byDate = (field) => {
      if (desde && hasta) return { [field]: { [Op.between]: [desde, hasta] } };
      if (desde) return { [field]: { [Op.gte]: desde } };
      if (hasta) return { [field]: { [Op.lte]: hasta } };
      return {};
    };

    const incluirSet = new Set(incluir.split(",").map((s) => s.trim()));

    // Traemos info del usuario (rol/unidad) para encabezado
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ["id", "nombre", "correo", "ci", "rolId", "unidadId"],
      include: [
        { model: Rol, attributes: ["id", "nombre"] },
        {
          model: Unidad,
          attributes: ["id", "nombre", "tipo", "tipo_institucion"],
        },
      ],
    });
    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    // ============== BLOQUE CREACIÓN DE EXPEDIENTES =================
    let creados = [];
    let creadosIds = [];
    let totalCreados = 0;

    if (incluirSet.has("creados")) {
      // Total para paginar
      totalCreados = await Expediente.count({
        where: { creadoPorId: usuarioId, ...byDate("createdAt") },
      });

      const rows = await Expediente.findAll({
        where: { creadoPorId: usuarioId, ...byDate("createdAt") },
        attributes: [
          "id",
          "tipo_documento",
          "numero_documento",
          "referencia",
          "fecha_ingreso",
          "estado",
          "urgencia",
          "updatedAt",
        ],
        order: [["id", "DESC"]],
        limit,
        offset,
      });

      creadosIds = rows.map((r) => r.id);

      // Buscar últimos movimientos de esos expedientes (en bloque)
      let ultimosPorExp = {};
      if (creadosIds.length) {
        // Movimientos ordenados por fecha desc; nos quedamos con el primero por expediente
        const movs = await Movimiento.findAll({
          where: { expedienteId: { [Op.in]: creadosIds }, eliminado: false },
          attributes: [
            "id",
            "expedienteId",
            "tipo",
            "fecha_movimiento",
            "unidadDestinoId",
          ],
          include: [
            {
              model: Unidad,
              as: "unidadDestino",
              attributes: ["id", "nombre", "tipo", "tipo_institucion"],
            },
          ],
          order: [
            ["fecha_movimiento", "DESC"],
            ["id", "DESC"],
          ],
        });

        for (const m of movs) {
          if (!ultimosPorExp[m.expedienteId]) {
            ultimosPorExp[m.expedienteId] = m;
          }
        }
      }

      creados = rows.map((e) => {
        const um = ultimosPorExp[e.id];
        return {
          id: e.id,
          tipo_documento: e.tipo_documento,
          numero_documento: e.numero_documento,
          referencia: e.referencia,
          fecha_ingreso: e.fecha_ingreso,
          estado: e.estado,
          urgencia: e.urgencia,
          ultima_actividad: e.updatedAt,
          ultimo_movimiento: um
            ? {
                id: um.id,
                tipo: um.tipo,
                fecha_movimiento: um.fecha_movimiento,
                unidadDestino: um.unidadDestino
                  ? {
                      id: um.unidadDestino.id,
                      nombre: um.unidadDestino.nombre,
                      tipo: um.unidadDestino.tipo,
                      tipo_institucion: um.unidadDestino.tipo_institucion,
                    }
                  : null,
              }
            : null,
        };
      });
    }

    // ============== BLOQUE MOVIMIENTOS REALIZADOS ==================
    let movimientosRealizados = [];
    let totalMovs = 0;

    if (incluirSet.has("movimientos")) {
      // Aplicar los mismos criterios: eliminado=false + rango de fechas
      totalMovs = await Movimiento.count({
        where: { usuarioId, eliminado: false, ...byDate("createdAt") },
      });

      movimientosRealizados = await Movimiento.findAll({
        where: { usuarioId, eliminado: false, ...byDate("createdAt") },
        attributes: [
          "id",
          "tipo",
          "fecha_movimiento",
          "observaciones",
          "expedienteId",
        ],
        include: [
          {
            model: Expediente,
            attributes: [
              "id",
              "tipo_documento",
              "numero_documento",
              "referencia",
              "estado",
              "urgencia",
            ],
          },
          {
            model: Unidad,
            as: "unidadOrigen",
            attributes: ["id", "nombre", "tipo", "tipo_institucion"],
          },
          {
            model: Unidad,
            as: "unidadDestino",
            attributes: ["id", "nombre", "tipo", "tipo_institucion"],
          },
        ],
        order: [
          ["fecha_movimiento", "DESC"],
          ["id", "DESC"],
        ],
        limit,
        offset,
      });
    }

    // ============== BLOQUE AUDITORÍA (si existe) ===================
    let auditoria = [];
    let totalAud = 0;

    if (incluirSet.has("auditoria") && Auditoria) {
      // En tu migración la fecha es `creado_en` (no createdAt)
      const whereAud = { usuario_id: usuarioId };
      if (desde || hasta) {
        whereAud.creado_en = {};
        if (desde) whereAud.creado_en[Op.gte] = `${desde} 00:00:00`;
        if (hasta) whereAud.creado_en[Op.lte] = `${hasta} 23:59:59`;
      }

      totalAud = await Auditoria.count({ where: whereAud });

      auditoria = await Auditoria.findAll({
        where: whereAud,
        attributes: [
          "id",
          "entidad",
          "entidad_id",
          "accion",
          "descripcion",
          "creado_en",
        ],
        order: [
          ["creado_en", "DESC"],
          ["id", "DESC"],
        ],
        limit,
        offset,
      });
    }

    // ========= Resumen =========
    const resumen = {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        ci: usuario.ci,
        rol: usuario.Rol?.nombre || null,
        unidad: usuario.Unidad
          ? {
              id: usuario.Unidad.id,
              nombre: usuario.Unidad.nombre,
              tipo: usuario.Unidad.tipo,
              tipo_institucion: usuario.Unidad.tipo_institucion,
            }
          : null,
      },
      totales: {
        expedientes_creados: totalCreados,
        movimientos_realizados: totalMovs,
        auditorias: totalAud,
      },
    };

    res.json({
      ok: true,
      mensaje: "Actividad del usuario",
      filtros: {
        usuarioId,
        desde,
        hasta,
        rango,
        limit,
        offset,
        incluir: [...incluirSet],
      },
      datos: {
        resumen,
        creados,
        movimientosRealizados,
        auditoria,
      },
    });
  } catch (error) {
    console.error("Error en actividadDeUsuario:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error obteniendo actividad del usuario",
      error,
    });
  }
};
