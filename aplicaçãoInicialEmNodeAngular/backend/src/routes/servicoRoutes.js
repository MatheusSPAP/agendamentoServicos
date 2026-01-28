const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rotas Públicas
router.get('/', servicoController.getServicos);
router.get('/:id', servicoController.getServicoById);

// Rotas Protegidas (Admin)
router.post('/', protect, isAdmin, servicoController.createServico);
router.put('/:id', protect, isAdmin, servicoController.updateServico);
router.delete('/:id', protect, isAdmin, servicoController.deleteServico);

module.exports = router;