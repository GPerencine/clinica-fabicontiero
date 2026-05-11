const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('FATAL: Variável de ambiente SECRET_KEY não definida. O servidor não pode iniciar.');
}

// Sanitiza a string para uso seguro dentro de uma RegExp (previne ReDoS)
const escapeRegex = (str) => str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

exports.login = async (req, res, next) => {
    try {
        const { usuario, senha } = req.body;
        
        // Busca o usuário no banco de forma case-insensitive
        const user = await Usuario.findOne({ 
            usuario: { $regex: new RegExp("^" + escapeRegex(usuario) + "$", "i") } 
        });
        
        // Verifica se o usuário existe e se a senha é válida
        if (!user || !(await user.compararSenha(senha))) {
            return res.status(401).json({ auth: false, mensagem: "Usuário ou senha incorretos." });
        }

        const token = jwt.sign(
            { id: user._id, user: user.usuario, nome: user.nome }, 
            SECRET_KEY, 
            { expiresIn: '8h' }
        );
        
        return res.json({ auth: true, token });
    } catch (error) {
        next(error);
    }
};

exports.verificarSessao = (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ auth: false });
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ auth: false });
        return res.json({ auth: true, user: decoded.user, nome: decoded.nome });
    });
};

