const { getMascotasPorUsuario } = require('../controllers/mascotaController');
const httpMocks = require('node-mocks-http');

jest.mock('../config/db', () => {
  const sqlMock = { Int: 'Int' };
  const reqMock = {
    input: jest.fn().mockReturnThis(),
    query: jest.fn().mockResolvedValue({ recordset: [{ id: 1, nombre: 'Firulais' }] }),
  };
  const poolMock = { request: jest.fn(() => reqMock) };

  return {
    sql: sqlMock,
    poolPromise: Promise.resolve(poolMock),
  };
});

describe('getMascotasPorUsuario', () => {
  it('debe retornar mascotas del usuario', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      user: { id: 1 },
    });
    const res = httpMocks.createResponse();

    await getMascotasPorUsuario(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('nombre');
  });

});
