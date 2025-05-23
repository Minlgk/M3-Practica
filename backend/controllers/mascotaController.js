const { poolPromise, sql } = require('../config/db');

exports.getMascotasPorUsuario = async (req, res) => {
  const userId = req.user.id;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('usuario_id', sql.Int, userId)
      .query(`
        SELECT m.id, m.nombre
        FROM Mascotas m
        JOIN Clientes c ON m.cliente_id = c.id
        WHERE c.usuario_id = @usuario_id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener mascotas');
  }
};
