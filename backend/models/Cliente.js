const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nome: String,
  whatsapp: { type: String, unique: true, required: true },
  dataNascimento: Date,
  anotacoes: { type: String, default: "" },
  dataCadastro: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

clienteSchema.virtual('idade').get(function() {
  if (!this.dataNascimento) return "N/A";
  const hoje = new Date();
  let idadeCalculada = hoje.getFullYear() - this.dataNascimento.getFullYear();
  const mes = hoje.getMonth() - this.dataNascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < this.dataNascimento.getDate())) {
      idadeCalculada--;
  }
  return `${idadeCalculada} anos`;
});

module.exports = mongoose.model('Cliente', clienteSchema);
