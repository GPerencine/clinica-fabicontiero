const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Erro interno no servidor';

    // Log seguro: NÃO incluímos req.path (dado controlado pelo usuário) para evitar S5145.
    // req.method é um valor fixo de um enum HTTP (GET, POST, etc.) — não é user-controlled.
    console.error(`[ERROR ${status}] ${req.method}: ${message}`);

    // Em desenvolvimento, podemos logar o stack trace do erro (interno, não do usuário)
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(status).json({
        error: true,
        message: process.env.NODE_ENV === 'production' && status === 500
            ? 'Erro interno no servidor'
            : message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
