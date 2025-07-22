const request = require("supertest");
const app = require("../app");

let adminToken, supervisorToken, operadorToken, visualizadorToken;
let tempUserId; // Usuario que vamos a crear y eliminar

beforeAll(async () => {
  // Login como admin
  const resAdmin = await request(app).post("/auth/login").send({
    usuario: "12345678",
    contraseña: "admin123",
  });
  adminToken = resAdmin.body.token;

  // Login supervisor
  const resSup = await request(app).post("/auth/login").send({
    usuario: "23456789",
    contraseña: "supervisor123",
  });
  supervisorToken = resSup.body.token;

  // Login operador
  const resOp = await request(app).post("/auth/login").send({
    usuario: "34567890",
    contraseña: "operador123",
  });
  operadorToken = resOp.body.token;

  // Login visualizador
  const resVis = await request(app).post("/auth/login").send({
    usuario: "45678901",
    contraseña: "visual123",
  });
  visualizadorToken = resVis.body.token;
});

describe("Usuarios - CRUD", () => {
  it("Lista usuarios (admin)", async () => {
    const res = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.datos)).toBe(true);
    expect(res.body.datos.length).toBeGreaterThanOrEqual(4); // los 4 pre-cargados
  });

  it("Lista usuarios (supervisor)", async () => {
    const res = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${supervisorToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.datos)).toBe(true);
  });

  it("NO permite listar usuarios al operador", async () => {
    const res = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("NO permite listar usuarios al visualizador", async () => {
    const res = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("Crea un usuario nuevo (admin)", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Test User",
        ci: "98765432",
        correo: "testuser@demo.com",
        contraseña: "clave123",
        rolId: 3,         // operador
        unidadId: 1,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.ci).toBe("98765432");
    tempUserId = res.body.datos.id;
  });

  it("NO permite crear usuario con CI duplicado", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Repetido",
        ci: "98765432", // igual al anterior
        correo: "otro@demo.com",
        contraseña: "clave123",
        rolId: 3,
        unidadId: 1,
      });
    expect(res.statusCode).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje || res.body.error).toMatch(/CI/i);
  });

  it("Actualiza usuario (supervisor)", async () => {
    const res = await request(app)
      .put(`/usuarios/${tempUserId}`)
      .set("Authorization", `Bearer ${supervisorToken}`)
      .send({
        nombre: "Usuario Actualizado",
        correo: "actualizado@demo.com",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.nombre).toBe("Usuario Actualizado");
    expect(res.body.datos.correo).toBe("actualizado@demo.com");
  });

  it("NO actualiza usuario inexistente", async () => {
    const res = await request(app)
      .put(`/usuarios/999999`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Nada",
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje || res.body.error).toMatch(/no encontrado/i);
  });

  it("Elimina usuario", async () => {
    const res = await request(app)
      .delete(`/usuarios/${tempUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.mensaje).toMatch(/eliminado/i);
  });

  it("NO elimina usuario inexistente", async () => {
    const res = await request(app)
      .delete(`/usuarios/999999`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje || res.body.error).toMatch(/no encontrado/i);
  });

  it("NO permite crear usuario si rol no es admin/supervisor", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({
        nombre: "Intruso",
        ci: "12341234",
        correo: "intruso@demo.com",
        contraseña: "intruso123",
        rolId: 4,
        unidadId: 1,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });
});
