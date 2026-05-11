const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Usuario = require('../models/Usuario');

let mongoServer;

describe('Testes de Autenticação', () => {
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        
        await mongoose.connect(uri);
        
        // Criar um usuário admin para teste
        await Usuario.create({
            nome: 'Admin Teste',
            usuario: 'admin',
            senha: 'password123',
            role: 'admin'
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('Login com credenciais válidas deve retornar token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'admin', senha: 'password123' });
        
        expect(response.status).toBe(200);
        expect(response.body.auth).toBe(true);
        expect(response.body.token).toBeDefined();
    });

    test('Login com senha incorreta deve falhar', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'admin', senha: 'wrongpassword' });
        
        expect(response.status).toBe(401);
        expect(response.body.auth).toBe(false);
    });

    test('Verificar sessão com token válido', async () => {
        // Primeiro logar para obter o token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'admin', senha: 'password123' });
        
        const token = loginRes.body.token;

        const response = await request(app)
            .get('/api/auth/check-session')
            .set('x-access-token', token);
        
        expect(response.status).toBe(200);
        expect(response.body.auth).toBe(true);
        expect(response.body.user).toBe('admin');
    });

    test('Verificar sessão com token inválido', async () => {
        const response = await request(app)
            .get('/api/auth/check-session')
            .set('x-access-token', 'token-invalido');
        
        expect(response.status).toBe(401);
        expect(response.body.auth).toBe(false);
    });
});
