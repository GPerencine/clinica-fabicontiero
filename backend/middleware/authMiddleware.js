const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('FATAL: Variável de ambiente SECRET_KEY não definida.');
}

const verificarToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).json({ mensagem: "Acesso negado." });
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ mensagem: "Token inválido ou expirado." });
        req.user = decoded.user;
        next();
    });
};

module.exports = verificarToken;
