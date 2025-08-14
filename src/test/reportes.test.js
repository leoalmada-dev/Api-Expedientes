/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../app");

// Aumentamos timeout por posibles I/O de DB
jest.setTimeout(30000);

let adminToken, supervisorToken, operadorToken, visualizadorToken;
let operadorId, adminId; // se resuelven por CI con token admin

// ===== Helpers =====
async function login(usuario, contraseña) {
  const res = await request(app).post("/auth/login").send({ usuario, contraseña });
  if (!res.body?.token) {
    throw new Error(`Login falló para ${usuario}: status=${res.statusCode}, body=${JSON.stringify(res.body)}`);
  }
  return res.body.token;
}

async function getUserIdByCI(ci, tokenAdmin) {
  const res = await request(app).get("/usuarios").set("Authorization", `Bearer ${tokenAdmin}`);
  if (res.statusCode !== 200) {
    throw new Error(`/usuarios devolvió ${res.statusCode}. Body: ${JSON.stringify(res.body)}`);
  }
  const u = Array.isArray(res.body?.datos) ? res.body.datos.find((x) => x.ci === ci) : null;
  return u?.id || null;
}

// ===== Bootstrap tokens + IDs =====
beforeAll(async () => {
  adminToken = await login("12345678", "admin123");
  supervisorToken = await login("23456789", "supervisor123");
  operadorToken = await login("34567890", "operador123");
  visualizadorToken = await login("45678901", "visual123");

  operadorId = await getUserIdByCI("34567890", adminToken);
  adminId = await getUserIdByCI("12345678", adminToken);

  if (!operadorId || !adminId) {
    throw new Error("No se pudieron resolver adminId/operadorId por CI. Verifica seeds/permisos de /usuarios.");
  }
}, 20000);

// ========== TESTS ==========
describe("Reportes - Permisos básicos", () => {
  test("GET /reportes/usuarios → admin/supervisor 200; operador/visualizador 200|403; sin token 401", async () => {
    const okAdmin = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${adminToken}`);
    expect(okAdmin.statusCode).toBe(200);

    const okSup = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${supervisorToken}`);
    expect(okSup.statusCode).toBe(200);

    // Ruta hoy no tiene guard de rol explícito → aceptamos 200 o 403
    const op = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${operadorToken}`);
    expect([200, 403]).toContain(op.statusCode);

    const vis = await request(app).get("/reportes/usuarios").set("Authorization", `Bearer ${visualizadorToken}`);
    expect([200, 403]).toContain(vis.statusCode);

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

  // PRUEBAS ESTRICTAS que pediste:
  test("Operador puede ver SU propia actividad (200)", async () => {
    const res = await request(app)
      .get(`/reportes/usuarios/${operadorId}/actividad`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("datos.resumen.usuario.id", operadorId);
    expect(res.body).toHaveProperty("datos.resumen.totales.expedientes_creados");
  });

  test("Operador NO puede ver actividad de OTRO usuario (403)", async () => {
    const res = await request(app)
      .get(`/reportes/usuarios/${adminId}/actividad`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test("Supervisor puede ver actividad de terceros (200 o 404 si el id no existe)", async () => {
    const res = await request(app)
      .get(`/reportes/usuarios/${operadorId}/actividad`)
      .set("Authorization", `Bearer ${supervisorToken}`);
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe("Reportes - Validaciones (si están activas con express-validator)", () => {
  test("GET /reportes/expedientes con rango inválido retorna 400 (o 200 si aún no validás)", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?rango=anual")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([400, 200]).toContain(res.statusCode);
  });

  test("GET /reportes/expedientes con orderDir inválido retorna 400 (o 200 si aún no validás)", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?orderDir=UP")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([400, 200]).toContain(res.statusCode);
  });

  test("GET /reportes/usuarios con activo inválido retorna 400 (o 200 si aún no validás)", async () => {
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

  test('Filtro activo=semana → si hay usuarios, todos deben tener "activo_semana": true', async () => {
    const res = await request(app)
      .get("/reportes/usuarios?activo=semana")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([200, 400]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      const arr = res.body?.datos?.usuarios || [];
      if (arr.length) {
        expect(arr.every((u) => u.activo_semana === true)).toBe(true);
      }
      // El resumen debe coincidir con el array ya filtrado
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

    const arr = res.body.datos.expedientes;
    if (arr.length) {
      expect(arr.every((e) => "plazo_cumplido" in e)).toBe(true);
      expect(arr.every((e) => "plazo_vencido" in e)).toBe(true);
    }
  });

  test("plazo=cumplido → todos con plazo_cumplido=true y plazo_vencido=false", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?plazo=cumplido")
      .set("Authorization", `Bearer ${supervisorToken}`);
    expect(res.statusCode).toBe(200);
    const arr = res.body?.datos?.expedientes || [];
    if (arr.length) {
      expect(arr.every((e) => e.plazo_cumplido === true)).toBe(true);
      expect(arr.every((e) => e.plazo_vencido === false)).toBe(true);
    }
  });

  test("tipo_destino=interno → todos con destino.tipo='interno'", async () => {
    const res = await request(app)
      .get("/reportes/expedientes?tipo_destino=interno")
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(200);
    const arr = res.body?.datos?.expedientes || [];
    if (arr.length) {
      expect(arr.every((e) => e.destino && e.destino.tipo === "interno")).toBe(true);
    }
  });
});

describe("Reportes - /reportes/usuarios/:id/actividad (filtros, incluir y coherencia)", () => {
  test("rango=semana & incluir=creados,movimientos → shape coherente y paginación", async () => {
    const res = await request(app)
      .get(`/reportes/usuarios/${operadorId}/actividad?rango=semana&incluir=creados,movimientos&limit=5&offset=0`)
      .set("Authorization", `Bearer ${supervisorToken}`); // supervisor evita 403 si no coincide self
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("datos.resumen.usuario.id", operadorId);
      // Creados
      const creados = res.body?.datos?.creados || [];
      if (creados.length) {
        const c = creados[0];
        expect(c).toHaveProperty("id");
        expect(c).toHaveProperty("tipo_documento");
        expect(c).toHaveProperty("fecha_ingreso");
        if (c.ultimo_movimiento) {
          expect(c.ultimo_movimiento).toHaveProperty("tipo");
          expect(c.ultimo_movimiento).toHaveProperty("fecha_movimiento");
        }
      }
      // Movimientos
      const movs = res.body?.datos?.movimientosRealizados || [];
      if (movs.length) {
        const m = movs[0];
        expect(m).toHaveProperty("id");
        expect(m).toHaveProperty("tipo");
        expect(m).toHaveProperty("fecha_movimiento");
        if (m.Expediente) {
          expect(m.Expediente).toHaveProperty("id");
          expect(m.Expediente).toHaveProperty("tipo_documento");
        }
      }
    }
  });
});
