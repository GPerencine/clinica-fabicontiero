const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
    clienteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cliente', 
        required: true 
    },
    servico: String, // Ex: facial, corporal
    queixa: String,  // Ex: Botox, Limpeza de Pele
    status: { type: String, default: 'Pendente' },
    dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);
