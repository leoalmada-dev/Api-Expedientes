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
    usuario: '23456789',    // CI del supervisor según tus seeds
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

  it('Crea un movimiento en expediente abierto', async () => {
    // Crea expediente primero
    const expediente = await request(app)
      .post('/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo_documento: "fisico",
        numero_documento: "FISICO 321/2025",
        forma_ingreso: "papel",
        fecha_ingreso: "2025-07-17",
        referencia: "test mov abierto",
        detalle: "Expediente para movimiento"
      });
    const expId = expediente.body.datos.id;

    // Crea movimiento
    const res = await request(app)
      .post(`/expedientes/${expId}/movimientos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: "salida",
        fecha_movimiento: "2025-07-18",
        unidadDestinoId: 2,
        unidadOrigenId: 1,
        observaciones: "Salida test"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.datos.tipo).toBe("salida");
  });

  it('NO permite crear movimiento en expediente cerrado', async () => {
    // Crea expediente como admin
    const expediente = await request(app)
      .post('/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo_documento: "memo",
        numero_documento: "MEMO 999/2025",
        forma_ingreso: "apia",
        fecha_ingreso: "2025-07-19",
        referencia: "Para cierre",
        detalle: "Se va a cerrar"
      });
    const expId = expediente.body.datos.id;

    // Cierra expediente como supervisor
    await request(app)
      .post(`/expedientes/${expId}/cerrar`)
      .set('Authorization', `Bearer ${supervisorToken}`);

    // Intenta crear movimiento como admin
    const res = await request(app)
      .post(`/expedientes/${expId}/movimientos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: "entrada",
        fecha_movimiento: "2025-07-20",
        unidadDestinoId: 1,
        observaciones: "Intento después de cierre"
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/expediente cerrado/i);
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
