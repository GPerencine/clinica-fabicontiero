const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true }
});

const DepoimentoSchema = new mongoose.Schema({
  autor: { type: String, required: true },
  texto: { type: String, required: true },
  estrelas: { type: Number, required: true, default: 5, min: 1, max: 5 }
});

const HomePageSchema = new mongoose.Schema({
  essencia: {
    titulo: { type: String, required: true, default: 'Nossa Essência' },
    descricao: { type: String, required: true, default: 'Realçando sua beleza com naturalidade.' },
    topicos: [TopicSchema],
    imagemEssencia: { type: String, default: '' }
  },
  resultados: {
    titulo: { type: String, required: true, default: 'Resultados Reais' },
    depoimentos: [DepoimentoSchema]
  }
}, { timestamps: true });

module.exports = mongoose.model('HomePage', HomePageSchema);
