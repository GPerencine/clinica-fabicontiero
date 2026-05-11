const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Usuario = require('../models/Usuario');

let mongoServer;
let token;

/**
 * Testes de integração para cenários transversais:
 * - Middleware de autenticação (edge cases)
 * - Error handler (respostas de erro padronizadas)
 * - Proteção de rotas administrativas
 */
describe('Testes de Middleware e Error Handling', () => {

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        await mongoose.connect(uri);

        await Usuario.create({
            nome: 'Admin Teste',
            usuario: 'admin',
            senha: 'password123',
            role: 'admin'
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

    // ────────────────────────────────────────────────
    // Auth Middleware — Cobertura de branches faltantes
    // ────────────────────────────────────────────────
    describe('Auth Middleware', () => {
        test('deve negar acesso sem header x-access-token (403)', async () => {
            const response = await request(app)
                .get('/api/agendamentos');
            // sem enviar o header

            expect(response.status).toBe(403);
            expect(response.body.mensagem).toBe('Acesso negado.');
        });

        test('deve negar acesso com token malformado (401)', async () => {
            const response = await request(app)
                .get('/api/agendamentos')
                .set('x-access-token', 'token.invalido.aqui');

            expect(response.status).toBe(401);
            expect(response.body.mensagem).toBe('Token inválido ou expirado.');
        });

        test('deve negar acesso com token de outra chave secreta (401)', async () => {
            // Token assinado com uma chave diferente da configurada no servidor
            const jwt = require('jsonwebtoken');
            const wrongKey = process.env.WRONG_SECRET_KEY_FOR_TEST || 'wrong-key-placeholder';
            const tokenErrado = jwt.sign({ id: 'fake', user: 'hacker' }, wrongKey, { expiresIn: '1h' });

            const response = await request(app)
                .get('/api/agendamentos')
                .set('x-access-token', tokenErrado);

            expect(response.status).toBe(401);
        });

        test('deve permitir acesso com token válido (200)', async () => {
            const response = await request(app)
                .get('/api/agendamentos')
                .set('x-access-token', token);

            expect(response.status).toBe(200);
        });
    });

    // ────────────────────────────────────────────────
    // Error Handler — Respostas padronizadas de erro
    // ────────────────────────────────────────────────
    describe('Error Handler', () => {
        test('deve retornar 404 com mensagem ao buscar ID inexistente em agendamentos', async () => {
            const idFake = new mongoose.Types.ObjectId();

            const response = await request(app)
                .patch(`/api/agendamentos/${idFake}`)
                .set('x-access-token', token)
                .send({ status: 'Confirmado' });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe(true);
            expect(response.body.message).toBeDefined();
        });

        test('deve retornar 404 ao deletar serviço inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/servicos/${idFake}`)
                .set('x-access-token', token);

            expect(response.status).toBe(404);
            // servicoController retorna { error: "Serviço não encontrado" }
            expect(response.body).toHaveProperty('error');
        });

        test('deve retornar 404 ao deletar cliente inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/clientes/${idFake}`)
                .set('x-access-token', token);

            expect(response.status).toBe(404);
            // clienteController retorna mensagem no formato próprio
            expect(response.body).toBeDefined();
        });
    });

    // ────────────────────────────────────────────────
    // Rate Limiting — Proteção contra força bruta
    // ────────────────────────────────────────────────
    describe('Rate Limiting', () => {
        test('API deve responder normalmente para requisições dentro do limite', async () => {
            const response = await request(app).get('/api/servicos');
            expect(response.status).toBe(200);
        });
    });

    // ────────────────────────────────────────────────
    // Rotas não-existentes
    // ────────────────────────────────────────────────
    describe('Rotas não mapeadas', () => {
        test('rota de API inexistente deve retornar 404', async () => {
            const response = await request(app).get('/api/rota-que-nao-existe');
            expect(response.status).toBe(404);
        });
    });
});
