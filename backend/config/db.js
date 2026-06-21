const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    console.log('✅ Utilizando conexão MongoDB existente (Serverless Cache)');
    return;
  }
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinica_estetica';
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('✅ Nova conexão ao MongoDB estabelecida');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
