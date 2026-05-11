const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    usuario: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    senha: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});

// Middleware para hash de senha antes de salvar
usuarioSchema.pre('save', async function() {
    if (!this.isModified('senha')) return;
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
});

// Método para comparar senhas
usuarioSchema.methods.compararSenha = async function(senhaCandidata) {
    return await bcrypt.compare(senhaCandidata, this.senha);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
