const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Servico = require('../models/Servico');

let mongoServer;

describe('API Clínica Fabi Contiero', () => {
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        
        // Desconectar se houver conexão ativa
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        
        await mongoose.connect(uri);
        
        // Criar um serviço para teste
        await Servico.create({
            titulo: 'Limpeza de Pele',
            descricao: 'Limpeza profunda',
            categoria: 'FACIAL',
            preco: 150,
            duracao: '60 min',
            imagem: 'test.jpg'
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('GET / deve retornar status 200', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Online');
    });

    test('GET /api/servicos deve retornar uma lista de serviços', async () => {
        const response = await request(app).get('/api/servicos');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].titulo).toBe('Limpeza de Pele');
    });

    test('Tentativa de login inválida deve retornar 401', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'errado', senha: '123' });
        expect(response.status).toBe(401);
    });
});
