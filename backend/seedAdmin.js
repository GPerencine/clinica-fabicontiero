require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinica_estetica';

// A senha deve ser passada via variável de ambiente ADMIN_PASS
// Nunca hardcode senhas em código fonte.
const ADMIN_PASS = process.env.ADMIN_PASS;
if (!ADMIN_PASS) {
    console.error('❌ ERRO: Variável de ambiente ADMIN_PASS não definida.');
    console.error('   Execute: ADMIN_PASS=suaSenhaAqui node seedAdmin.js');
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado ao MongoDB para seeding');

        const adminUser = process.env.ADMIN_USER || 'fabi';
        const usuarioExistente = await Usuario.findOne({ usuario: adminUser });
        
        if (usuarioExistente) {
            console.log(`⚠️  Usuário '${adminUser}' já existe. Atualizando senha...`);
            // O hook pre('save') do model irá fazer o hash automaticamente
            usuarioExistente.senha = ADMIN_PASS;
            await usuarioExistente.save();
            console.log(`✅ Senha do usuário '${adminUser}' atualizada com sucesso!`);
        } else {
            const novoAdmin = new Usuario({
                nome: 'Fabi Contiero',
                usuario: adminUser,
                senha: ADMIN_PASS,
                role: 'admin'
            });
            await novoAdmin.save();
            console.log(`✅ Usuário '${adminUser}' criado com sucesso!`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Erro no seeding:', err);
        process.exit(1);
    }
}

seed();
