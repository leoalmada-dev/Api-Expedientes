const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
let adminToken;
let supervisorToken;
let operadorToken;
let visualizadorToken;
const expedientesCreados = []; // IDs de expedientes creados para borrar al final

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
  // Borra todos los expedientes creados en este ciclo (que no hayan sido eliminados durante los tests)
  for (const id of expedientesCreados) {
    try {
      await request(app)
        .delete(`/expedientes/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);
    } catch (e) {
      // Si ya estaba eliminado, ignorar error
    }
  }
}, 15000);

describe("Expedientes", () => {
  it("Crea un expediente con su primer movimiento", async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "TEST-EXP-200/2025",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-16",
        referencia: "Test expediente",
        detalle: "Detalles desde test",
        urgencia: "comun", // <--- Agregado!
        primer_movimiento: {
          tipo: "entrada",
          fecha_movimiento: "2025-07-16",
          unidadDestinoId: 1,
          observaciones: "Ingreso inicial test",
        },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos).toBeDefined();
    expect(res.body.datos.tipo_documento).toBe("oficio");
    expedientesCreados.push(res.body.datos.id);
  });

  it("Crea un expediente sin movimiento", async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "memo",
        numero_documento: "TEST-EXP-1234/2025",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-17",
        referencia: "Solo expediente test",
        detalle: "Test sin movimiento",
        urgencia: "comun", // <--- Agregado!
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expedientesCreados.push(res.body.datos.id);
  });

  it("Crea un movimiento en expediente abierto", async () => {
    // Crea expediente primero
    const expediente = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "fisico",
        numero_documento: "TEST-EXP-321/2025",
        forma_ingreso: "papel",
        fecha_ingreso: "2025-07-17",
        referencia: "test mov abierto",
        detalle: "Expediente para movimiento",
        urgencia: "comun", // <--- Agregado!
      });
    const expId = expediente.body.datos.id;
    expedientesCreados.push(expId);

    // Crea movimiento
    const res = await request(app)
      .post(`/expedientes/${expId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "salida",
        fecha_movimiento: "2025-07-18",
        unidadDestinoId: 2,
        unidadOrigenId: 1,
        observaciones: "Salida test",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.tipo).toBe("salida");
  });

  it("NO permite crear movimiento en expediente cerrado", async () => {
    // Crea expediente como admin
    const expediente = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "memo",
        numero_documento: "TEST-EXP-999/2025",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-19",
        referencia: "Para cierre",
        detalle: "Se va a cerrar",
        urgencia: "comun", // <--- Agregado!
      });
    const expId = expediente.body.datos.id;
    expedientesCreados.push(expId);

    // Cierra expediente como supervisor
    await request(app)
      .post(`/expedientes/${expId}/cerrar`)
      .set("Authorization", `Bearer ${supervisorToken}`);

    // Intenta crear movimiento como admin
    const res = await request(app)
      .post(`/expedientes/${expId}/movimientos`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-20",
        unidadDestinoId: 1,
        observaciones: "Intento después de cierre",
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/expediente cerrado/i);
  });

  it("NO crea expediente si faltan campos obligatorios", async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "",
        numero_documento: "",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errores || res.body.mensaje).toBeDefined();
  });

  it('Crea un expediente con urgencia "urgente"', async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "TEST-EXP-URGENTE-1",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-28",
        referencia: "Exp urgente",
        detalle: "Debe quedar con urgencia urgente",
        urgencia: "urgente", // <--- Ya estaba bien aquí
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.urgencia).toBe("urgente");
    expedientesCreados.push(res.body.datos.id);
  });

  it("NO permite crear expediente sin urgencia", async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "memo",
        numero_documento: "TEST-EXP-SIN-URG",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-28",
        referencia: "Sin urgencia",
        detalle: "Esto no debe crearse",
        // urgencia: NO SE ENVÍA!
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/urgencia/i);
  });

  it("NO permite urgencia inválida", async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "fisico",
        numero_documento: "TEST-EXP-INVALID-URG",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-28",
        referencia: "Urgencia inválida",
        detalle: "Esto debe fallar",
        urgencia: "urgencísimo", // inválido
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/urgencia/i);
  });
  it("Devuelve solo expedientes cerrados cuando se filtra por estado", async () => {
    const res = await request(app)
      .get("/expedientes?estado=cerrado") // adaptar si el query param es diferente
      .set("Authorization", `Bearer ${adminToken}`); // usa el token que corresponda

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);

    const expedientes = res.body.datos;

    // Asegura que todos estén cerrados
    const algunoAbierto = expedientes.some((exp) => exp.estado !== "cerrado");

    expect(algunoAbierto).toBe(false); // No debe haber ni uno abierto
  });
});

describe("Expedientes - Update y Delete", () => {
  let expedienteId;

  beforeAll(async () => {
    // Crea expediente para test
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "TEST-EXP-111/2025",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-21",
        referencia: "Update test",
        detalle: "Para actualizar",
        urgencia: "comun", // <--- Agregado!
      });
    expedienteId = res.body.datos.id;
    expedientesCreados.push(expedienteId);
  });

  it("Actualiza expediente correctamente", async () => {
    const res = await request(app)
      .put(`/expedientes/${expedienteId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        referencia: "Referencia actualizada",
        detalle: "Detalle actualizado",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.referencia).toBe("Referencia actualizada");
  });

  it("No actualiza expediente eliminado", async () => {
    // Elimina expediente
    await request(app)
      .delete(`/expedientes/${expedienteId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    const res = await request(app)
      .put(`/expedientes/${expedienteId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ referencia: "No debería actualizar" });
    expect(res.statusCode).toBe(410);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/eliminado/);
  });
});

it("Elimina expediente lógicamente y loguea la acción", async () => {
  // Crea un expediente nuevo
  const res = await request(app)
    .post("/expedientes")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      tipo_documento: "memo",
      numero_documento: "TEST-EXP-555/2025",
      forma_ingreso: "apia",
      fecha_ingreso: "2025-07-21",
      referencia: "Para borrar",
      detalle: "Eliminación lógica",
      urgencia: "comun", // <--- Agregado!
    });
  const expId = res.body.datos.id;
  expedientesCreados.push(expId);

  // Elimina el expediente
  const delRes = await request(app)
    .delete(`/expedientes/${expId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  expect(delRes.statusCode).toBe(200);
  expect(delRes.body.ok).toBe(true);
  expect(delRes.body.mensaje).toMatch(/eliminado/i);

  // Comprueba que no aparece en la lista normal
  const listRes = await request(app)
    .get("/expedientes")
    .set("Authorization", `Bearer ${adminToken}`);
  const existe = listRes.body.datos.some((e) => e.id === expId);
  expect(existe).toBe(false);
});

it("Filtra expedientes por tipo_documento", async () => {
  // Asegúrate de tener al menos 1 expediente tipo "oficio"
  const res = await request(app)
    .get("/expedientes?tipo_documento=oficio")
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.ok).toBe(true);
  // Todos los resultados deben tener el tipo_documento = 'oficio'
  res.body.datos.forEach((e) => {
    expect(e.tipo_documento).toBe("oficio");
  });
});

describe("Expedientes - permisos", () => {
  it("Operador puede crear expediente", async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${operadorToken}`)
      .send({
        tipo_documento: "memo",
        numero_documento: "TEST-EXP-OPERADOR",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-25",
        referencia: "Operador crea",
        detalle: "Expediente operador",
        urgencia: "comun", // <--- Agregado!
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expedientesCreados.push(res.body.datos.id);
  });

  it("Visualizador NO puede crear expediente", async () => {
    const res = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({
        tipo_documento: "memo",
        numero_documento: "TEST-EXP-VISUALIZADOR",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-25",
        referencia: "Visualizador intenta",
        detalle: "No debería poder",
        urgencia: "comun", // <--- Agregado!
      });
    // Puede devolver 403 (lo más estricto) o 401 según tu backend
    expect([401, 403]).toContain(res.statusCode);
    expect(res.body.ok).toBe(false);
  });

  it("Visualizador NO puede actualizar ni eliminar expedientes", async () => {
    // Creamos primero un expediente como admin para este test
    const resExp = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "TEST-EXP-VISUAL-EDIT",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-26",
        referencia: "Para test de permisos",
        detalle: "No editable por visualizador",
        urgencia: "comun", // <--- Agregado!
      });
    const expId = resExp.body.datos.id;
    expedientesCreados.push(expId);

    // Intentar update
    const updateRes = await request(app)
      .put(`/expedientes/${expId}`)
      .set("Authorization", `Bearer ${visualizadorToken}`)
      .send({ referencia: "No debería" });
    expect([401, 403]).toContain(updateRes.statusCode);
    expect(updateRes.body.ok).toBe(false);

    // Intentar delete
    const delRes = await request(app)
      .delete(`/expedientes/${expId}`)
      .set("Authorization", `Bearer ${visualizadorToken}`);
    expect([401, 403]).toContain(delRes.statusCode);
    expect(delRes.body.ok).toBe(false);
  });

  it("Operador NO puede eliminar expediente", async () => {
    // Creamos primero un expediente como admin para este test
    const resExp = await request(app)
      .post("/expedientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_documento: "fisico",
        numero_documento: "TEST-EXP-OPER-DELETE",
        forma_ingreso: "papel",
        fecha_ingreso: "2025-07-27",
        referencia: "Para delete operador",
        detalle: "No debería eliminar",
        urgencia: "comun", // <--- Agregado!
      });
    const expId = resExp.body.datos.id;
    expedientesCreados.push(expId);

    // Intentar delete como operador
    const delRes = await request(app)
      .delete(`/expedientes/${expId}`)
      .set("Authorization", `Bearer ${operadorToken}`);
    expect([401, 403]).toContain(delRes.statusCode);
    expect(delRes.body.ok).toBe(false);
  });
});
