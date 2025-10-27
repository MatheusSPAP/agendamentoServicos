const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rota pública para buscar horários disponíveis
router.get('/available-slots', agendamentoController.getAvailableSlots);

// Rotas protegidas
router.route('/')
    .post(protect, agendamentoController.createAgendamento) 
    .get(protect, agendamentoController.getAgendamentos); 

router.route('/:id')
    .get(protect, agendamentoController.getAgendamentoById) 
    .put(protect, isAdmin, agendamentoController.updateAgendamento) 
    .delete(protect, agendamentoController.cancelAgendamento); 

module.exports = router;