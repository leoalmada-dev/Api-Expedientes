const request = require("supertest");
const app = require("../app");

let adminToken, supervisorToken, operadorToken, visualizadorToken;
let unidadId; // Usada para pruebas de permisos y limpieza

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

  // Crea unidad para los tests de permisos
  const res = await request(app)
    .post("/unidades")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ nombre: "Unidad Restricción" });
  unidadId = res.body.datos.id;
});

afterAll(async () => {
  // Elimina la unidad de prueba si aún existe (borrado físico)
  await request(app)
    .delete(`/unidades/${unidadId}`)
    .set("Authorization", `Bearer ${adminToken}`);
});

describe("Unidades - CRUD (Admin/Supervisor)", () => {
  let tempUnidadId;

  it("Crea una unidad nueva (admin)", async () => {
    const res = await request(app)
      .post("/unidades")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: "Unidad Test" });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.nombre).toBe("Unidad Test");
    tempUnidadId = res.body.datos.id;
  });

  it("Lista unidades", async () => {
    const res = await request(app)
      .get("/unidades")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
    // Debe incluir la unidad creada
    expect(res.body.datos.some(u => u.id === tempUnidadId)).toBe(true);
  });

  it("Actualiza unidad (supervisor)", async () => {
    const res = await request(app)
      .put(`/unidades/${tempUnidadId}`)
      .set("Authorization", `Bearer ${supervisorToken}`)
      .send({ nombre: "Unidad Actualizada" });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.nombre).toBe("Unidad Actualizada");
  });

  it("Elimina unidad (admin)", async () => {
    const res = await request(app)
      .delete(`/unidades/${tempUnidadId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.mensaje).toMatch(/eliminada/i);
  });
});

describe("Unidades - Restricción de permisos (operador y visualizador)", () => {
  it("Operador NO puede crear unidad", async () => {
    const res = await request(app)
      .post("/unidades")
      .set("Authorization", `Bearer ${operadorToken}`)
      .send({ nombre: "No debe crear" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Visualizador NO puede crear unidad", async () => {
    const res = await request(app)
      .post("/unidades")
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({ nombre: "No debe crear" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Operador NO puede actualizar unidad", async () => {
    const res = await request(app)
      .put(`/unidades/${unidadId}`)
      .set("Authorization", `Bearer ${operadorToken}`)
      .send({ nombre: "Intento Operador" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Visualizador NO puede actualizar unidad", async () => {
    const res = await request(app)
      .put(`/unidades/${unidadId}`)
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({ nombre: "Intento Visualizador" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Operador NO puede eliminar unidad", async () => {
    const res = await request(app)
      .delete(`/unidades/${unidadId}`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Visualizador NO puede eliminar unidad", async () => {
    const res = await request(app)
      .delete(`/unidades/${unidadId}`)
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Operador SÍ puede listar unidades", async () => {
    const res = await request(app)
      .get("/unidades")
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
  });

  it("Visualizador SÍ puede listar unidades", async () => {
    const res = await request(app)
      .get("/unidades")
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
  });
});
