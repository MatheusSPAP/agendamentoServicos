const express = require('express');
const router = express.Router();
const profissionalServicoController = require('../controllers/profissionalServicoController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rotas Públicas
router.get('/profissional/:id', profissionalServicoController.getServicesByProfissional);
router.get('/servico/:id', profissionalServicoController.getProfissionaisByService);

// Rotas Protegidas (Admin)
router.post('/', protect, isAdmin, profissionalServicoController.assignServiceToProfissional);
router.delete('/', protect, isAdmin, profissionalServicoController.unassignServiceFromProfissional);

module.exports = router;