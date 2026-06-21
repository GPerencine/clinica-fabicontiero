const Servico = require('../models/Servico');

const getBaseUrl = () => process.env.BASE_URL;

// Campos permitidos — previne mass assignment
const CAMPOS_PERMITIDOS = ['titulo', 'descricao', 'preco', 'duracao', 'categoria', 'icone'];

const filtrarCampos = (body) => {
  return CAMPOS_PERMITIDOS.reduce((acc, campo) => {
    if (body[campo] !== undefined) acc[campo] = body[campo];
    return acc;
  }, {});
};

exports.listarServicos = async (req, res, next) => {
  try {
    const servicos = await Servico.find().sort({ dataCriacao: -1 });
    res.json(servicos);
  } catch (error) {
    next(error);
  }
};

exports.criarServico = async (req, res, next) => {
  try {
    const dados = filtrarCampos(req.body);
    if (req.file) {
      dados.imagem = `${getBaseUrl()}/uploads/${req.file.filename}`;
    }
    const novo = new Servico(dados);
    await novo.save();
    res.status(201).json(novo);
  } catch (error) {
    next(error);
  }
};

exports.atualizarServico = async (req, res, next) => {
  try {
    const { id } = req.body;
    const dados = filtrarCampos(req.body);
    if (req.file) {
      dados.imagem = `${getBaseUrl()}/uploads/${req.file.filename}`;
    }
    const atualizado = await Servico.findByIdAndUpdate(id, dados, { returnDocument: 'after', runValidators: true });
    if (!atualizado) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(atualizado);
  } catch (error) {
    next(error);
  }
};

exports.deletarServico = async (req, res, next) => {
  try {
    const deletado = await Servico.findByIdAndDelete(req.params.id);
    if (!deletado) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json({ mensagem: 'Serviço removido' });
  } catch (error) {
    next(error);
  }
};
