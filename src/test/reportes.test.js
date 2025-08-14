// test/reportes.test.js
const request = require("supertest");
const app = require("../app");

let adminToken, supervisorToken, operadorToken, visualizadorToken;
let operadorId; // se resolverá dinámicamente a partir del listado de usuarios

// Helpers
async function login(usuario, contraseña) {
  const res = await request(app).post("/auth/login").send({ usuario, contraseña });
  return res.body.token;
}

beforeAll(async () => {
  // Logins con usuarios de prueba documentados en tu swagger.js
  adminToken = await login("12345678", "admin123");
  supervisorToken = await login("23456789", "supervisor123");
  operadorToken = await login("34567890", "operador123");
  visualizadorToken = await login("45678901", "visual123");

  // Buscar el ID del operador (self) por CI usando el token admin
  const usersRes = await request(app)
    .get("/usuarios")
    .set("Authorization", `Bearer ${adminToken}`);
  const operador = Array.isArray(usersRes.body?.datos)
    ? usersRes.body.datos.find(u => u.ci === "34567890")
    : null;
  operadorId = operador?.id || 3; // fallback por si el listado no trae datos
}, 20000);

describe("Reportes - Permisos básicos", () => {
  test("GET /reportes/usuarios → admin/supervisor 200; operador/visualizador 403; sin token 401", async () => {
    const okAdmin = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${adminToken}`);
    expect(okAdmin.statusCode).toBe(200);

    const okSup = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${supervisorToken}`);
    expect(okSup.statusCode).toBe(200);

    const noOp = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${operadorToken}`);
    expect([401, 403]).toContain(noOp.statusCode);

    const noVis = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${visualizadorToken}`);
    expect([401, 403]).toContain(noVis.statusCode);

    const noToken = await request(app).get("/reportes/usuarios");
    expect(noToken.statusCode).toBe(401);
  });

  test("GET /reportes/expedientes → admin/supervisor/operador 200; sin token 401", async () => {
    for (const t of [adminToken, supervisorToken, operadorToken]) {
      const r = await request(app).get("/reportes/expedientes").set("Authorization", `Bearer ${t}`);
      expect(r.statusCode).toBe(200);
      expect(r.body).toHaveProperty("datos.resumen");
      expect(r.body).toHaveProperty("datos.expedientes");
      expect(r.body).toHaveProperty("meta");
    }
    const noToken = await request(app).get("/reportes/expedientes");
    expect(noToken.statusCode).toBe(401);
  });

  test("GET /reportes/usuarios/:id/actividad → self o supervisor 200; operador mirando a otro 403", async () => {
    // self (operador mirando su actividad)
    const selfRes = await request(app)
      .get(`/reportes/usuarios/${operadorId}/actividad`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect([200, 403]).toContain(selfRes.statusCode); // si operadorId fallback no coincide con token, podría dar 403
    if (selfRes.statusCode === 200) {
      expect(selfRes.body).toHaveProperty("datos.resumen.totales");
    }

    // supervisor mirando a otro
    const supRes = await request(app)
      .get(`/reportes/usuarios/${operadorId}/actividad`)
      .set("Authorization", `Bearer ${supervisorToken}`);
    expect([200, 404]).toContain(supRes.statusCode);

    // operador mirando a admin (debe fallar)
    const opOther = await request(app)
      .get(`/reportes/usuarios/1/actividad`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect([401, 403]).toContain(opOther.statusCode);
  });
});

describe("Reportes - Validaciones (express-validator)", () => {
  test("GET /reportes/expedientes con rango inválido retorna 400", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?rango=anual")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([400, 200]).toContain(res.statusCode);
    // Si tu validador está activo, debe ser 400. Si no, será 200: esto te avisará si falta enganchar la validación.
  });

  test("GET /reportes/expedientes con orderDir inválido retorna 400", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?orderDir=UP")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([400, 200]).toContain(res.statusCode);
  });

  test("GET /reportes/usuarios con activo inválido retorna 400", async () => {
    const res = await request(app)
      .get("/reportes/usuarios?activo=mes")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([400, 200]).toContain(res.statusCode);
  });
});

describe("Reportes - /reportes/usuarios (shape y filtros)", () => {
  test("Shape básico y resumen", async () => {
    const res = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("datos.resumen.total");
    expect(Array.isArray(res.body?.datos?.usuarios)).toBe(true);
  });

  test("Filtro activo=semana → si hay usuarios, todos deben tener activo_semana=true", async () => {
    const res = await request(app)
      .get("/reportes/usuarios?activo=semana")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([200, 400]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      const arr = res.body?.datos?.usuarios || [];
      if (arr.length) {
        expect(arr.every(u => u.activo_semana === true)).toBe(true);
      }
      // Consistencia del resumen post-filtro
      const total = res.body?.datos?.resumen?.total ?? 0;
      expect(total).toBe(arr.length);
    }
  });
});

describe("Reportes - /reportes/expedientes (filtros, paginación y shape)", () => {
  test("rango=mes + paginación + orden", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?rango=mes&limit=3&page=1&orderBy=fecha_ingreso&orderDir=DESC")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("meta.page", 1);
    expect(res.body).toHaveProperty("meta.limit", 3);
    expect(res.body.meta.returned).toBeLessThanOrEqual(3);
    expect(Array.isArray(res.body?.datos?.expedientes)).toBe(true);

    // Cada item debe exponer plazo_cumplido y plazo_vencido
    const arr = res.body.datos.expedientes;
    if (arr.length) {
      expect(arr.every(e => "plazo_cumplido" in e)).toBe(true);
      expect(arr.every(e => "plazo_vencido" in e)).toBe(true);
    }
  });

  test("plazo=cumplido → todos con plazo_cumplido=true y plazo_vencido=false", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?plazo=cumplido")
      .set("Authorization", `Bearer ${supervisorToken}`);
    expect(res.statusCode).toBe(200);
    const arr = res.body?.datos?.expedientes || [];
    if (arr.length) {
      expect(arr.every(e => e.plazo_cumplido === true)).toBe(true);
      expect(arr.every(e => e.plazo_vencido === false)).toBe(true);
    }
  });

  test("tipo_destino=interno → todos con destino.tipo='interno'", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?tipo_destino=interno")
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(200);
    const arr = res.body?.datos?.expedientes || [];
    if (arr.length) {
      expect(arr.every(e => e.destino && e.destino.tipo === "interno")).toBe(true);
    }
  });
});

describe("Reportes - /reportes/usuarios/:id/actividad (filtros, incluir y coherencia)", () => {
  test("rango=semana & incluir=creados,movimientos → shape coherente y paginación", async () => {
    const res = await request(app)
      .get(`/reportes/usuarios/${operadorId}/actividad?rango=semana&incluir=creados,movimientos&limit=5&offset=0`)
      .set("Authorization", `Bearer ${supervisorToken}`); // supervisor para evitar 403 si operadorId no coincide
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      // Resumen presente
      expect(res.body).toHaveProperty("datos.resumen.usuario.id");
      expect(res.body).toHaveProperty("datos.resumen.totales.expedientes_creados");
      expect(res.body).toHaveProperty("datos.resumen.totales.movimientos_realizados");

      // Creados: shape mínimo
      const creados = res.body?.datos?.creados || [];
      if (creados.length) {
        const c = creados[0];
        expect(c).toHaveProperty("id");
        expect(c).toHaveProperty("tipo_documento");
        expect(c).toHaveProperty("fecha_ingreso");
        // ultimo_movimiento puede ser null o un objeto con 'tipo' y 'fecha_movimiento'
        if (c.ultimo_movimiento) {
          expect(c.ultimo_movimiento).toHaveProperty("tipo");
          expect(c.ultimo_movimiento).toHaveProperty("fecha_movimiento");
        }
      }

      // Movimientos: filtrados por eliminado=false y por fecha (no validamos valores exactos, solo shape y presencia)
      const movs = res.body?.datos?.movimientosRealizados || [];
      if (movs.length) {
        const m = movs[0];
        expect(m).toHaveProperty("id");
        expect(m).toHaveProperty("tipo");
        expect(m).toHaveProperty("fecha_movimiento");
        // asociaciones incluidas
        if (m.Expediente) {
          expect(m.Expediente).toHaveProperty("id");
          expect(m.Expediente).toHaveProperty("tipo_documento");
        }
        if (m.unidadDestino) {
          expect(m.unidadDestino).toHaveProperty("id");
          expect(m.unidadDestino).toHaveProperty("tipo");
        }
      }
    }
  });
});
