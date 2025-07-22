const request = require('supertest');
const app = require('../app');
let adminToken;
let supervisorToken;

beforeAll(async () => {
  // Login admin
  const adminRes = await request(app).post('/auth/login').send({
    usuario: '12345678',
    contraseña: 'admin123'
  });
  adminToken = adminRes.body.token;

  // Login supervisor
  const supRes = await request(app).post('/auth/login').send({
    usuario: '23456789',
    contraseña: 'supervisor123'
  });
  supervisorToken = supRes.body.token;
});

describe('Expedientes', () => {
  it('Crea un expediente con su primer movimiento', async () => {
    const res = await request(app)
      .post('/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "OFICIO N.º 200/2025",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-16",
        referencia: "Test expediente",
        detalle: "Detalles desde test",
        primer_movimiento: {
          tipo: "entrada",
          fecha_movimiento: "2025-07-16",
          unidadDestinoId: 1,
          observaciones: "Ingreso inicial test"
        }
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos).toBeDefined();
    expect(res.body.datos.tipo_documento).toBe("oficio");
  });

  it('Crea un expediente sin movimiento', async () => {
    const res = await request(app)
      .post('/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo_documento: "memo",
        numero_documento: "MEMO 1234/2025",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-17",
        referencia: "Solo expediente test",
        detalle: "Test sin movimiento"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  it('NO crea expediente si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo_documento: "",
        numero_documento: "",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errores || res.body.mensaje).toBeDefined();
  });
});

describe('Expedientes - Update y Delete', () => {
  let expedienteId;

  beforeAll(async () => {
    // Crea expediente para test
    const res = await request(app)
      .post('/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo_documento: "oficio",
        numero_documento: "OFICIO 111/2025",
        forma_ingreso: "correo",
        fecha_ingreso: "2025-07-21",
        referencia: "Update test",
        detalle: "Para actualizar"
      });
    expedienteId = res.body.datos.id;
  });

  it('Actualiza expediente correctamente', async () => {
    const res = await request(app)
      .put(`/expedientes/${expedienteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        referencia: "Referencia actualizada",
        detalle: "Detalle actualizado"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.referencia).toBe("Referencia actualizada");
  });

  it('No actualiza expediente eliminado', async () => {
    // Elimina expediente
    await request(app)
      .delete(`/expedientes/${expedienteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app)
      .put(`/expedientes/${expedienteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ referencia: "No debería actualizar" });
    expect(res.statusCode).toBe(410);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/eliminado/);
  });
});

it('Elimina expediente lógicamente y loguea la acción', async () => {
  // Crea un expediente nuevo
  const res = await request(app)
    .post('/expedientes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      tipo_documento: "memo",
      numero_documento: "MEMO 555/2025",
      forma_ingreso: "apia",
      fecha_ingreso: "2025-07-21",
      referencia: "Para borrar",
      detalle: "Eliminación lógica"
    });
  const expId = res.body.datos.id;

  // Elimina el expediente
  const delRes = await request(app)
    .delete(`/expedientes/${expId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  expect(delRes.statusCode).toBe(200);
  expect(delRes.body.ok).toBe(true);
  expect(delRes.body.mensaje).toMatch(/eliminado/i);

  // Comprueba que no aparece en la lista normal
  const listRes = await request(app)
    .get('/expedientes')
    .set('Authorization', `Bearer ${adminToken}`);
  const existe = listRes.body.datos.some(e => e.id === expId);
  expect(existe).toBe(false);
});

it('Filtra expedientes por tipo_documento', async () => {
  // Asegúrate de tener al menos 1 expediente tipo "oficio"
  const res = await request(app)
    .get('/expedientes?tipo_documento=oficio')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.ok).toBe(true);
  // Todos los resultados deben tener el tipo_documento = 'oficio'
  res.body.datos.forEach(e => {
    expect(e.tipo_documento).toBe("oficio");
  });
});
