const express = require('express');
const router = express.Router();
const { getMascotasPorUsuario } = require('../controllers/mascotaController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/mascotas', verifyToken, getMascotasPorUsuario);

module.exports = router;
