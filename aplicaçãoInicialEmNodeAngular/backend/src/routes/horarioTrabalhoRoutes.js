const express = require('express');
const router = express.Router();
const horarioTrabalhoController = require('../controllers/horarioTrabalhoController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Todas as rotas são protegidas para administradores
router.route('/')
    .post(protect, isAdmin, horarioTrabalhoController.createHorario)
    .get(protect, isAdmin, horarioTrabalhoController.getHorarios);

router.route('/:id')
    .get(protect, isAdmin, horarioTrabalhoController.getHorarioById)
    .put(protect, isAdmin, horarioTrabalhoController.updateHorario)
    .delete(protect, isAdmin, horarioTrabalhoController.deleteHorario);

module.exports = router;