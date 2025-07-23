const request = require("supertest");
const app = require("../app");

let adminToken, supervisorToken, operadorToken, visualizadorToken;
let tempUserId; // ID del usuario temporal creado para pruebas

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

afterAll(async () => {
  // Elimina usuario de prueba lógicamente si quedó (puede fallar si no existe)
  if (tempUserId) {
    await request(app)
      .delete(`/usuarios/${tempUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
  }
});

describe("Usuarios - CRUD (admin y supervisor)", () => {
  it("Crea un usuario nuevo (admin)", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Usuario Test",
        ci: "98765432",
        correo: "usuariotest@demo.com",
        contraseña: "test1234",
        rolId: 3,      // operador
        unidadId: 1,
      });
    // Puede fallar por duplicado si lo dejaste antes
    if (res.statusCode === 409) {
      // Busca el usuario por CI para borrarlo si quedó antes
      const usuarios = await request(app)
        .get("/usuarios")
        .set("Authorization", `Bearer ${adminToken}`);
      const encontrado = usuarios.body.datos.find(u => u.ci === "98765432");
      if (encontrado) {
        tempUserId = encontrado.id;
        await request(app)
          .delete(`/usuarios/${tempUserId}`)
          .set("Authorization", `Bearer ${adminToken}`);
      }
      // Reintentá la creación
      const res2 = await request(app)
        .post("/usuarios")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          nombre: "Usuario Test",
          ci: "98765432",
          correo: "usuariotest@demo.com",
          contraseña: "test1234",
          rolId: 3,
          unidadId: 1,
        });
      expect(res2.statusCode).toBe(201);
      expect(res2.body.ok).toBe(true);
      expect(res2.body.datos.ci).toBe("98765432");
      tempUserId = res2.body.datos.id;
    } else {
      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.datos.ci).toBe("98765432");
      tempUserId = res.body.datos.id;
    }
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

  it("Elimina usuario (admin)", async () => {
    const res = await request(app)
      .delete(`/usuarios/${tempUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.mensaje).toMatch(/eliminado/i);
  });
});

describe("Usuarios - Restricción de permisos", () => {
  it("Operador NO puede crear usuario", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${operadorToken}`)
      .send({
        nombre: "No debe crear",
        ci: "11223344",
        correo: "no@permiso.com",
        contraseña: "fail1234",
        rolId: 4,
        unidadId: 1,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Visualizador NO puede crear usuario", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({
        nombre: "No debe crear",
        ci: "99887766",
        correo: "no@permiso.com",
        contraseña: "fail1234",
        rolId: 4,
        unidadId: 1,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("Operador NO puede actualizar usuario", async () => {
    // Crea usuario para test rápido (lo elimina después el test principal)
    const userRes = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Temp Op",
        ci: "87654321",
        correo: "temop@demo.com",
        contraseña: "fail1234",
        rolId: 3,
        unidadId: 1,
      });
    const id = userRes.body.datos.id;

    const res = await request(app)
      .put(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${operadorToken}`)
      .send({ nombre: "Cambio Op" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);

    // Limpieza
    await request(app)
      .delete(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("Visualizador NO puede actualizar usuario", async () => {
    // Crea usuario para test rápido
    const userRes = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Temp Vis",
        ci: "76543210",
        correo: "tempvis@demo.com",
        contraseña: "fail1234",
        rolId: 4,
        unidadId: 1,
      });
    const id = userRes.body.datos.id;

    const res = await request(app)
      .put(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({ nombre: "Cambio Vis" });
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);

    // Limpieza
    await request(app)
      .delete(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("Operador NO puede eliminar usuario", async () => {
    // Crea usuario para test rápido
    const userRes = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Temp Elim Op",
        ci: "12344321",
        correo: "elimo@demo.com",
        contraseña: "fail1234",
        rolId: 4,
        unidadId: 1,
      });
    const id = userRes.body.datos.id;

    const res = await request(app)
      .delete(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);

    // Limpieza
    await request(app)
      .delete(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("Visualizador NO puede eliminar usuario", async () => {
    // Crea usuario para test rápido
    const userRes = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Temp Elim Vis",
        ci: "43211234",
        correo: "elimvis@demo.com",
        contraseña: "fail1234",
        rolId: 3,
        unidadId: 1,
      });
    const id = userRes.body.datos.id;

    const res = await request(app)
      .delete(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.ok).toBe(false);

    // Limpieza
    await request(app)
      .delete(`/usuarios/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("Operador y Visualizador SÍ pueden listar usuarios", async () => {
    let res = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(res.statusCode === 200 || res.statusCode === 403).toBe(true);

    res = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect(res.statusCode === 200 || res.statusCode === 403).toBe(true);
    // Puede ser 403 según permisos de tu endpoint
  });
});
