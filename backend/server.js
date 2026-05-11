require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const morgan = require('morgan');

// Importação das Rotas
const authRoutes = require('./routes/authRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const homePageRoutes = require('./routes/homePageRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── TRUST PROXY: deve ser a primeira configuração do app ────────────────────
// A Vercel injeta X-Forwarded-For em todas as requests. Sem isso, o
// express-rate-limit lança ERR_ERL_UNEXPECTED_X_FORWARDED_FOR e o CORS
// pode falhar em cold starts.
app.set('trust proxy', 1);

// --- Middlewares ---
app.use(morgan('dev'));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://*.googleapis.com"],
      "img-src": ["'self'", "data:", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://*.googleapis.com", "https://*.gstatic.com"],
      "frame-src": ["'self'", "https://maps.googleapis.com"],
      "connect-src": ["'self'", "https://maps.googleapis.com", "https://*.googleapis.com"]
    },
  },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://fabicontiero.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Handler OPTIONS explícito: garante resposta 204 em preflights antes de
// qualquer outra rota (inclusive o rate-limiter que entra depois)
app.options('/*path', cors({ origin: allowedOrigins, credentials: true }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições vindas deste IP, tente novamente mais tarde." }
});
app.use("/api/", limiter);

// --- Conexão com MongoDB ---
const connectDB = require('./config/db');
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// --- Definição das Rotas ---
app.use('/api/auth', authRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/homepage', homePageRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use(errorHandler);

// Rota raiz para verificar se a API está no ar
app.get('/', (req, res) => {
  res.send('API Clínica Fabi Contiero - Online (Vercel Serverless)');
});

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
}

module.exports = app;