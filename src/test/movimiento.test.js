const request = require("supertest");
const app = require("../app");

let adminToken, supervisorToken, operadorToken, visualizadorToken;

beforeAll(async () => {
  // Login admin
  const adminRes = await request(app).post("/auth/login").send({
    usuario: "12345678",
    contraseña: "admin123",
  });
  adminToken = adminRes.body.token;

  // Login supervisor
  const supRes = await request(app).post("/auth/login").send({
    usuario: "23456789",
    contraseña: "supervisor123",
  });
  supervisorToken = supRes.body.token;

  // Login operador
  const opRes = await request(app).post("/auth/login").send({
    usuario: "34567890",
    contraseña: "operador123",
  });
  operadorToken = opRes.body.token;

  // Login visualizador
  const visRes = await request(app).post("/auth/login").send({
    usuario: "45678901",
    contraseña: "visual123",
  });
  visualizadorToken = visRes.body.token;
});

describe("Movimientos - CRUD y permisos", () => {
  let expedienteId;
  let movimientoId;

  beforeAll(async () => {
    // Crea expediente para movimientos
    const resExp = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "MOV-001",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-22",
        referencia: "Test movimiento",
        detalle: "Movimientos CRUD test",
      });
    expedienteId = resExp.body.datos.id;
  });

  afterAll(async () => {
    // Borra expediente de prueba (borrado lógico)
    await request(app)
      .delete(`/expedientes/${expedienteId}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("Crea un movimiento (admin)", async () => {
    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-22",
        unidadDestinoId: 1,
        observaciones: "Alta movimiento test",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.tipo).toBe("entrada");
    movimientoId = res.body.datos.id;
  });

  it("Actualiza un movimiento (supervisor)", async () => {
    const res = await request(app)
      .put(`/movimientos/${movimientoId}`)
      .set("Authorization", `Bearer ${supervisorToken}`)
      .send({ observaciones: "Obs editada" });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.observaciones).toBe("Obs editada");
  });

  it("Elimina un movimiento lógicamente (admin)", async () => {
    const res = await request(app)
      .delete(`/movimientos/${movimientoId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.mensaje).toMatch(/eliminado/i);
  });

  it("NO permite crear movimiento con campos vacíos", async () => {
    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ tipo: "", fecha_movimiento: "" });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errores || res.body.mensaje).toBeDefined();
  });

  it("Obtiene historial de movimientos del expediente (admin)", async () => {
    // Crea un nuevo movimiento para ver en historial
    await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-23",
        unidadDestinoId: 1,
        observaciones: "Para historial",
      });

    const res = await request(app)
      .get(`/movimientos/${expedienteId}/historial`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.movimientos.length).toBeGreaterThanOrEqual(1);
    expect(res.body.datos.movimientos[0].expedienteId).toBe(expedienteId);
  });

  it("Operador puede crear movimiento", async () => {
    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${operadorToken}`)
      .send({
        tipo: "salida",
        fecha_movimiento: "2025-07-24",
        unidadDestinoId: 2,
        unidadOrigenId: 1,
        observaciones: "Operador test",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.tipo).toBe("salida");
  });

  it("Visualizador NO puede crear movimiento", async () => {
    const res = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({
        tipo: "salida",
        fecha_movimiento: "2025-07-24",
        unidadDestinoId: 2,
        unidadOrigenId: 1,
        observaciones: "No debería poder",
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Visualizador puede ver historial", async () => {
    const res = await request(app)
      .get(`/movimientos/${expedienteId}/historial`)
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("Visualizador y operador NO pueden actualizar o borrar movimiento", async () => {
    // Crea nuevo movimiento para editar
    const resMov = await request(app)
      .post(`/expedientes/${expedienteId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-25",
        unidadDestinoId: 1,
        observaciones: "Solo edición test",
      });
    const tempMovId = resMov.body.datos.id;

    // Actualiza como operador
    let res = await request(app)
      .put(`/movimientos/${tempMovId}`)
      .set("Authorization", `Bearer ${operadorToken}`)
      .send({ observaciones: "Prohibido editar" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);

    // Actualiza como visualizador
    res = await request(app)
      .put(`/movimientos/${tempMovId}`)
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({ observaciones: "Prohibido editar" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);

    // Borra como operador
    res = await request(app)
      .delete(`/movimientos/${tempMovId}`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);

    // Borra como visualizador
    res = await request(app)
      .delete(`/movimientos/${tempMovId}`)
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });
});
