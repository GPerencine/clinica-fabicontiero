const Cliente = require('../models/Cliente');
const Agendamento = require('../models/Agendamento');

exports.verificarCliente = async (req, res, next) => {
  try {
    const { whatsapp } = req.params; 
    const cliente = await Cliente.findOne({ whatsapp });

    if (cliente) {
      return res.json({
        existe: true,
        nome: cliente.nome,
        dataNascimento: cliente.dataNascimento
      });
    }
    res.json({ existe: false });
  } catch (error) {
    next(error);
  }
};

exports.getHistorico = async (req, res, next) => {
    try {
        const { whatsapp } = req.params;
        const cliente = await Cliente.findOne({ whatsapp });
        if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });

        const historico = await Agendamento.find({ clienteId: cliente._id }).sort({ dataCriacao: -1 });
        res.json({ cliente, historico });
    } catch (error) {
        next(error);
    }
};

exports.deleteCliente = async (req, res, next) => {
    try {
        const idParaDeletar = req.params.id;
        await Agendamento.deleteMany({ clienteId: idParaDeletar });
        const resultado = await Cliente.findByIdAndDelete(idParaDeletar);
        
        if (!resultado) {
            return res.status(404).json({ erro: "Cliente não encontrado." });
        }
        res.json({ mensagem: "Cliente e histórico removidos!" });
    } catch (error) {
        next(error);
    }
};

exports.atualizarAnotacoes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { anotacoes } = req.body;
        const cliente = await Cliente.findByIdAndUpdate(
            id,
            { anotacoes },
            { new: true }
        );
        if (!cliente) {
            return res.status(404).json({ erro: "Cliente não encontrado." });
        }
        res.json(cliente);
    } catch (error) {
        next(error);
    }
};

exports.getTodosClientes = async (req, res, next) => {
    try {
        const clientes = await Cliente.find().sort({ nome: 1 });
        res.json(clientes);
    } catch (error) {
        next(error);
    }
};
