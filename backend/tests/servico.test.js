const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Servico = require('../models/Servico');
const Usuario = require('../models/Usuario');

let mongoServer;
let token;

describe('Testes de Serviço', () => {
    
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
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('Criar novo serviço (Autenticado)', async () => {
        const response = await request(app)
            .post('/api/servicos')
            .set('x-access-token', token)
            .send({
                titulo: 'Botox',
                descricao: 'Aplicação de botox',
                categoria: 'FACIAL',
                preco: 800,
                duracao: '30 min'
            });
        
        expect(response.status).toBe(201);
        expect(response.body.titulo).toBe('Botox');
    });

    test('Listar serviços (Público)', async () => {
        const response = await request(app).get('/api/servicos');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Atualizar serviço (Autenticado)', async () => {
        const servico = await Servico.findOne({ titulo: 'Botox' });
        
        const response = await request(app)
            .post('/api/servicos')
            .set('x-access-token', token)
            .send({
                id: servico._id,
                titulo: 'Botox Premium',
                preco: 950
            });
        
        expect(response.status).toBe(200);
        expect(response.body.titulo).toBe('Botox Premium');
        expect(response.body.preco).toBe(950);
    });

    test('Deletar serviço (Autenticado)', async () => {
        const servico = await Servico.findOne({ titulo: 'Botox Premium' });
        
        const response = await request(app)
            .delete(`/api/servicos/${servico._id}`)
            .set('x-access-token', token);
        
        expect(response.status).toBe(200);
        expect(response.body.mensagem).toBe('Serviço removido');
        
        const busca = await Servico.findById(servico._id);
        expect(busca).toBeNull();
    });
});
