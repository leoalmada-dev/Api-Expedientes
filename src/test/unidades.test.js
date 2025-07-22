const request = require("supertest");
const app = require("../app");

let adminToken, supervisorToken;

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
});

describe("Unidades - CRUD", () => {
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

  it("NO permite crear unidad sin permisos", async () => {
    // Login como operador
    const opRes = await request(app).post("/auth/login").send({
      usuario: "34567890", // CI operador
      contraseña: "operador123",
    });
    const opToken = opRes.body.token;

    const res = await request(app)
      .post("/unidades")
      .set("Authorization", `Bearer ${opToken}`)
      .send({ nombre: "Unidad sin permiso" });
    expect(res.statusCode).toBe(403);
  });
});
