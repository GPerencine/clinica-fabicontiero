const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const verificarToken = require('../middleware/authMiddleware');

router.get('/', verificarToken, clienteController.getTodosClientes);
router.get('/:whatsapp/historico', verificarToken, clienteController.getHistorico);
router.delete('/:id', verificarToken, clienteController.deleteCliente);
router.put('/:id/anotacoes', verificarToken, clienteController.atualizarAnotacoes);

module.exports = router;
