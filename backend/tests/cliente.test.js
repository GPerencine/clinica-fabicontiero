const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');

let mongoServer;
let token;

describe('Testes de Cliente', () => {
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        
        await mongoose.connect(uri);
        
        // Criar admin e obter token
        await Usuario.create({
            nome: 'Admin',
            usuario: 'admin',
            senha: 'password123'
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'admin', senha: 'password123' });
        
        token = loginRes.body.token;

        // Criar um cliente inicial
        await Cliente.create({
            nome: 'João Silva',
            whatsapp: '11999999999',
            dataNascimento: '1990-01-01'
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('Verificar existência de cliente por WhatsApp', async () => {
        const response = await request(app)
            .get('/api/clientes/11999999999');
        
        expect(response.status).toBe(200);
        expect(response.body.existe).toBe(true);
        expect(response.body.nome).toBe('João Silva');
    });

    test('Verificar cliente inexistente', async () => {
        const response = await request(app)
            .get('/api/clientes/00000000000');
        
        expect(response.status).toBe(200);
        expect(response.body.existe).toBe(false);
    });

    test('Listar histórico de cliente (Autenticado)', async () => {
        const response = await request(app)
            .get('/api/clientes/11999999999/historico')
            .set('x-access-token', token);
        
        expect(response.status).toBe(200);
        expect(response.body.cliente.nome).toBe('João Silva');
        expect(Array.isArray(response.body.historico)).toBe(true);
    });

    test('Deletar cliente (Autenticado)', async () => {
        const cliente = await Cliente.findOne({ whatsapp: '11999999999' });
        
        const response = await request(app)
            .delete(`/api/clientes/${cliente._id}`)
            .set('x-access-token', token);
        
        expect(response.status).toBe(200);
        expect(response.body.mensagem).toContain('removidos');
        
        const busca = await Cliente.findById(cliente._id);
        expect(busca).toBeNull();
    });
});
