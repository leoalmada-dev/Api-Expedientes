const request = require("supertest");
const app = require("../app");
let adminToken, expedienteId, movimientoId;

beforeAll(async () => {
  // Login admin
  const adminRes = await request(app).post("/auth/login").send({
    usuario: "12345678",
    contraseña: "admin123",
  });
  adminToken = adminRes.body.token;

  // Crea un expediente para pruebas de movimientos
  const resExp = await request(app)
    .post("/expedientes")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      tipo_documento: "memo",
      numero_documento: "MEMO 333/2025",
      forma_ingreso: "apia",
      fecha_ingreso: "2025-07-21",
      referencia: "Para movs",
      detalle: "Movimientos test",
    });
  expedienteId = resExp.body.datos.id;
});

describe("Movimientos", () => {
  it("Crea un movimiento de entrada", async () => {
    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-21",
        unidadDestinoId: 1,
        observaciones: "Primer movimiento",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.tipo).toBe("entrada");
    // Guardamos el ID para las pruebas siguientes
    movimientoId = res.body.datos.id;
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
    // Elimina el expediente (si no fue eliminado antes)
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
    // Creamos un expediente y un movimiento para este test para asegurar que exista
    const resExp = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "HIST-002",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-22",
        referencia: "Test historial",
        detalle: "Probando historial",
      });
    const expId = resExp.body.datos.id;

    await request(app)
      .post(`/expedientes/${expId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-22",
        unidadDestinoId: 1,
        observaciones: "Mov. inicial para historial",
      });

    const res = await request(app)
      .get(`/movimientos/${expId}/historial`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos).toBeDefined();
    expect(res.body.datos.movimientos.length).toBeGreaterThanOrEqual(1);
    expect(res.body.datos.movimientos[0].expedienteId).toBe(expId);
  });
});
