const { login } = require('../controllers/authController');
const httpMocks = require('node-mocks-http');

jest.mock('bcrypt', () => ({
  compare: jest.fn(() => true),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt-token'),
}));
jest.mock('../config/db', () => {
  const sqlMock = { NVarChar: 'NVarChar' };
  const reqMock = {
    input: jest.fn().mockReturnThis(),
    query: jest.fn().mockResolvedValue({
      recordset: [{ id: 1, rol: 'admin', correo: 'test@example.com', contrasena_hash: 'hashed' }],
    }),
  };
  const poolMock = { request: jest.fn(() => reqMock) };
  return {
    sql: sqlMock,
    poolPromise: Promise.resolve(poolMock),
  };
});

describe('login', () => {
  it('debe loguear exitosamente y devolver token', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { correo: 'test@example.com', contrasena: '123456' },
    });
    const res = httpMocks.createResponse();

    await login(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('token', 'mocked-jwt-token');
    expect(data).toHaveProperty('rol', 'admin');
  });

  it('debe devolver 404 si el usuario no existe', async () => {
    const db = require('../config/db');
    const pool = await db.poolPromise;
    pool.request = jest.fn(() => ({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    }));

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { correo: 'nouser@example.com', contrasena: '123456' },
    });
    const res = httpMocks.createResponse();

    await login(req, res);
    expect(res.statusCode).toBe(404);
    expect(res._getData()).toBe('Usuario no encontrado');
  });

  it('debe devolver 401 si la contraseña es incorrecta', async () => {
    const bcrypt = require('bcrypt');
    bcrypt.compare.mockResolvedValue(false);

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { correo: 'test@example.com', contrasena: 'wrongpass' },
    });
    const res = httpMocks.createResponse();

    await login(req, res);
    expect(res.statusCode).toBe(401);
    expect(res._getData()).toBe('Contraseña incorrecta');
  });
});
