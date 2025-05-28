const { crearCita } = require('../controllers/citaController');
const httpMocks = require('node-mocks-http');

// Mocks de conexión a base de datos
jest.mock('../config/db', () => {
  const sqlMock = {
    DateTime: 'DateTime',
    NVarChar: 'NVarChar',
    Int: 'Int',
  };
  const reqMock = {
    input: jest.fn().mockReturnThis(),
    query: jest.fn(),
  };
  const poolMock = {
    request: jest.fn(() => reqMock),
  };
  return {
    sql: sqlMock,
    poolPromise: Promise.resolve(poolMock),
  };
});

describe('crearCita', () => {
  it('debe crear una cita correctamente', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        fecha: '2025-06-01T10:00:00.000Z',
        motivo: 'Vacunación',
        mascota_id: 1,
      },
    });
    const res = httpMocks.createResponse();
    await crearCita(req, res);
    expect(res.statusCode).toBe(201);
    expect(res._getData()).toBe('Cita creada');
  });

});
