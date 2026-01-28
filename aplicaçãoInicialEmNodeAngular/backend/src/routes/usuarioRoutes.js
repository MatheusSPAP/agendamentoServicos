const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', usuarioController.register);
router.post('/login', usuarioController.login);

// Rota protegida para criar um novo administrador
router.post('/admin/create', protect, isAdmin, usuarioController.createAdmin);

module.exports = router;