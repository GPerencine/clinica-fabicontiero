const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const verificarToken = require('../middleware/authMiddleware');

router.post('/', agendamentoController.agendar);
router.get('/', verificarToken, agendamentoController.listarAgendamentos);
router.patch('/:id', verificarToken, agendamentoController.atualizarStatus);
router.delete('/:id', verificarToken, agendamentoController.deletarAgendamento);

module.exports = router;
