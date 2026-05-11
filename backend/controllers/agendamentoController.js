const Agendamento = require('../models/Agendamento');
const Cliente = require('../models/Cliente');

exports.agendar = async (req, res, next) => {
    try {
        const { nome, whatsapp, dataNascimento, servico, queixa } = req.body;

        if (!whatsapp || typeof whatsapp !== 'string') {
            return res.status(400).json({ mensagem: "Número de WhatsApp inválido." });
        }

        // Sanitização: remove tudo que não é número antes de usar na query do banco
        const whatsappSanitizado = whatsapp.replaceAll(/\D/g, '');
        if (!whatsappSanitizado) {
            return res.status(400).json({ mensagem: "Número de WhatsApp inválido." });
        }

        let cliente = await Cliente.findOne({ whatsapp: whatsappSanitizado });

        if (cliente) {
            cliente.nome = nome || cliente.nome;
            cliente.dataNascimento = dataNascimento || cliente.dataNascimento;
            await cliente.save();
        } else {
            cliente = new Cliente({ nome, whatsapp, dataNascimento });
            await cliente.save();
        }

        const novoAgendamento = new Agendamento({
            clienteId: cliente._id,
            servico,
            queixa
        });

        await novoAgendamento.save();
        res.status(201).json({ mensagem: "Agendamento realizado com sucesso!" });
    } catch (error) {
        next(error);
    }
};

exports.listarAgendamentos = async (req, res, next) => {
    try {
        const lista = await Agendamento.find()
            .populate('clienteId') 
            .sort({ dataCriacao: -1 })
            .lean(); 
        
        const listaFormatada = lista.map(item => ({
            _id: item._id,
            nome: item.clienteId ? item.clienteId.nome : "Cliente Excluído",
            whatsapp: item.clienteId ? item.clienteId.whatsapp : "N/A",
            idade: item.clienteId ? item.clienteId.idade : "N/A",
            dataNascimento: item.clienteId ? item.clienteId.dataNascimento : null,
            servico: item.servico,
            queixa: item.queixa,
            status: item.status,
            dataCriacao: item.dataCriacao,
        }));

        res.json(listaFormatada);
    } catch (error) {
        next(error);
    }
};

exports.atualizarStatus = async (req, res, next) => {
    try {
        const atualizado = await Agendamento.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        if (!atualizado) {
            const err = new Error("Agendamento não encontrado");
            err.status = 404;
            throw err;
        }
        res.json(atualizado);
    } catch (error) {
        next(error);
    }
};

exports.deletarAgendamento = async (req, res, next) => {
    try {
        const deletado = await Agendamento.findByIdAndDelete(req.params.id);
        if (!deletado) {
            const err = new Error("Agendamento não encontrado");
            err.status = 404;
            throw err;
        }
        res.json({ mensagem: "Agendamento removido!" });
    } catch (error) {
        next(error);
    }
};
