const request = require('supertest');
const app = require('../app'); // Asegurate que exportás app en src/app.js

describe('Autenticación - POST /auth/login', () => {
  it('Login exitoso con usuario y contraseña correctos', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        usuario: '12345678',
        contraseña: 'admin123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).not.toBe(false); // Puede ser undefined, true, etc.
    expect(res.body.token).toBeDefined();
    expect(res.body.datos).toBeDefined();
    expect(res.body.datos.rol.nombre).toBe('admin'); // O el nombre correcto según seed
  });

  it('Falla con CI inexistente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        usuario: '99999999',
        contraseña: 'admin123'
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje || res.body.error).toMatch(/usuario no encontrado/i);
  });

  it('Falla con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        usuario: '12345678',
        contraseña: 'contramal'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje || res.body.error).toMatch(/contraseña incorrecta/i);
  });

  it('Falla si faltan datos obligatorios', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        usuario: ''
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.mensaje).toMatch(/datos inválidos/i);
  });
});
