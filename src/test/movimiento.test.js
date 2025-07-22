const request = require("supertest");
const app = require("../app");
let adminToken;
const expedientesCreados = [];
const movimientosCreados = [];

beforeAll(async () => {
  // Login admin
  const adminRes = await request(app).post("/auth/login").send({
    usuario: "12345678",
    contraseña: "admin123",
  });
  adminToken = adminRes.body.token;
});

afterAll(async () => {
  // Borra movimientos de test
  for (const id of movimientosCreados) {
    try {
      await request(app)
        .delete(`/movimientos/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);
    } catch (e) {}
  }
  // Borra expedientes de test
  for (const id of expedientesCreados) {
    try {
      await request(app)
        .delete(`/expedientes/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);
    } catch (e) {}
  }
});

describe("Movimientos", () => {
  let expedienteId, movimientoId;

  beforeAll(async () => {
    // Crea expediente para los movimientos de test
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "MOV-TEST-001",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-22",
        referencia: "Test movs",
        detalle: "Pruebas movimientos",
      });
    expedienteId = res.body.datos.id;
    expedientesCreados.push(expedienteId);
  });

  it("Crea un movimiento de entrada", async () => {
    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-22",
        unidadDestinoId: 1,
        observaciones: "Movimiento de prueba",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.tipo).toBe("entrada");
    movimientoId = res.body.datos.id;
    movimientosCreados.push(movimientoId);
  });

  it("Actualiza un movimiento", async () => {
    const res = await request(app)
      .put(`/movimientos/${movimientoId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ observaciones: "Obs editada" });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.observaciones).toBe("Obs editada");
  });

  it("Elimina un movimiento lógicamente", async () => {
    const res = await request(app)
      .delete(`/movimientos/${movimientoId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.mensaje).toMatch(/eliminado/i);
  });

  it("NO permite crear movimiento si faltan campos obligatorios", async () => {
    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "",
        fecha_movimiento: "",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errores || res.body.mensaje).toBeDefined();
  });

  it("NO permite crear movimiento en expediente eliminado", async () => {
    // Elimina el expediente
    await request(app)
      .delete(`/expedientes/${expedienteId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-22",
        unidadDestinoId: 1,
        observaciones: "Intento en eliminado",
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/eliminado/i);
  });

  it("Obtiene historial de movimientos de un expediente", async () => {
    // Crea expediente y un movimiento nuevo
    const resExp = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "fisico",
        numero_documento: "MOV-TEST-002",
        forma_ingreso: "papel",
        fecha_ingreso: "2025-07-23",
        referencia: "Para historial",
        detalle: "Historial test",
      });
    const nuevoExpId = resExp.body.datos.id;
    expedientesCreados.push(nuevoExpId);

    const resMov = await request(app)
      .post(`/expedientes/${nuevoExpId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-23",
        unidadDestinoId: 1,
        observaciones: "Para historial",
      });
    const nuevoMovId = resMov.body.datos.id;
    movimientosCreados.push(nuevoMovId);

    const res = await request(app)
      .get(`/movimientos/${nuevoExpId}/historial`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos).toBeDefined();
    expect(res.body.datos.movimientos.length).toBeGreaterThanOrEqual(1);
    expect(res.body.datos.movimientos[0].expedienteId).toBe(nuevoExpId);
  });
});
