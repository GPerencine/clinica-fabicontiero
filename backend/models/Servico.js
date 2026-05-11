const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  categoria: { type: String, enum: ['FACIAL', 'CORPORAL', 'CAPILAR'], required: true },
  icone: { type: String }, // Pode ser o nome de um ícone ou um emoji
  preco: { type: Number }, // Opcional, caso queira exibir valores
  duracao: { type: String }, // Ex: "1h 30min"
  imagem: { type: String } // Base64 da imagem
});

module.exports = mongoose.model('Servico', servicoSchema);
