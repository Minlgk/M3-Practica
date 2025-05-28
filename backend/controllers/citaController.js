
const { poolPromise, sql } = require('../config/db');

// Obtener citas por rol
exports.getCitas = async (req, res) => {
  const { id, rol } = req.user;
  try {
    const pool = await poolPromise;
    let query;
    if (rol === 'veterinario' || rol === 'admin') {
      query = 'SELECT * FROM Citas WHERE estado = \'programada\'';
    } else if (rol === 'cliente') {
      query = `SELECT c.* FROM Citas c 
               JOIN Mascotas m ON c.mascota_id = m.id 
               JOIN Clientes cl ON m.cliente_id = cl.id 
               WHERE cl.usuario_id = ${id} AND c.estado = 'programada'`;
    } else {
      return res.status(403).send('Rol no permitido');
    }
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Error al obtener citas');
  }
};

// Crear cita
exports.crearCita = async (req, res) => {
  const { fecha, motivo, mascota_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('fecha', sql.DateTime, fecha)
      .input('motivo', sql.NVarChar, motivo)
      .input('mascota_id', sql.Int, mascota_id)
      .query('INSERT INTO Citas (fecha, motivo, mascota_id, estado) VALUES (@fecha, @motivo, @mascota_id, \'programada\')');
    res.status(201).send('Cita creada');
  } catch {
    res.status(500).send('Error al crear cita');
  }
};

// Editar cita
exports.editarCita = async (req, res) => {
  const { id } = req.params;
  const { fecha, motivo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('fecha', sql.DateTime, fecha)
      .input('motivo', sql.NVarChar, motivo)
      .query('UPDATE Citas SET fecha = @fecha, motivo = @motivo WHERE id = @id');
    res.send('Cita actualizada');
  } catch {
    res.status(500).send('Error al editar cita');
  }
};

// Eliminar cita
exports.eliminarCita = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Citas WHERE id = @id');
    res.send('Cita eliminada');
  } catch {
    res.status(500).send('Error al eliminar cita');
  }
};
