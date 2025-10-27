const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rotas Públicas
router.get('/', profissionalController.getProfissionais);
router.get('/:id', profissionalController.getProfissionalById);

// Rotas Protegidas (Admin)
router.post('/', protect, isAdmin, profissionalController.createProfissional);
router.put('/:id', protect, isAdmin, profissionalController.updateProfissional);
router.delete('/:id', protect, isAdmin, profissionalController.deleteProfissional);

module.exports = router;