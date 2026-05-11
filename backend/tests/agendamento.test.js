const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Agendamento = require('../models/Agendamento');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');

let mongoServer;
let token;

describe('Testes de Agendamento', () => {

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        await mongoose.connect(uri);

        // Criar admin e obter token para rotas protegidas
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

    afterEach(async () => {
        // Limpa agendamentos e clientes entre testes para isolamento
        await Agendamento.deleteMany({});
        await Cliente.deleteMany({});
    });

    // ────────────────────────────────────────────────
    // POST /api/agendamentos — Criar novo agendamento
    // ────────────────────────────────────────────────
    describe('POST /api/agendamentos', () => {
        test('deve criar agendamento e cliente novo com sucesso', async () => {
            const response = await request(app)
                .post('/api/agendamentos')
                .send({
                    nome: 'Maria Silva',
                    whatsapp: '11988887777',
                    dataNascimento: '1990-05-15',
                    servico: 'facial',
                    queixa: 'Botox'
                });

            expect(response.status).toBe(201);
            expect(response.body.mensagem).toBe('Agendamento realizado com sucesso!');

            // Verifica persistência no banco
            const cliente = await Cliente.findOne({ whatsapp: '11988887777' });
            expect(cliente).not.toBeNull();
            expect(cliente.nome).toBe('Maria Silva');

            const agendamento = await Agendamento.findOne({ clienteId: cliente._id });
            expect(agendamento).not.toBeNull();
            expect(agendamento.queixa).toBe('Botox');
            expect(agendamento.status).toBe('Pendente');
        });

        test('deve atualizar dados de cliente existente ao re-agendar', async () => {
            // Cria cliente inicial
            await Cliente.create({
                nome: 'João Antigo',
                whatsapp: '11977776666',
                dataNascimento: '1985-01-01'
            });

            const response = await request(app)
                .post('/api/agendamentos')
                .send({
                    nome: 'João Atualizado',
                    whatsapp: '11977776666',
                    dataNascimento: '1985-01-01',
                    servico: 'corporal',
                    queixa: 'Massagem'
                });

            expect(response.status).toBe(201);

            const cliente = await Cliente.findOne({ whatsapp: '11977776666' });
            expect(cliente.nome).toBe('João Atualizado');

            // Garante que não criou duplicata
            const count = await Cliente.countDocuments({ whatsapp: '11977776666' });
            expect(count).toBe(1);
        });

        test('deve rejeitar agendamento sem whatsapp (campo obrigatório)', async () => {
            const response = await request(app)
                .post('/api/agendamentos')
                .send({
                    nome: 'Cliente Sem Fone',
                    servico: 'facial',
                    queixa: 'Limpeza'
                });

            expect(response.status).toBe(400);
            expect(response.body.mensagem).toBe('Número de WhatsApp inválido.');
        });

        test('deve rejeitar agendamento com whatsapp não-string', async () => {
            const response = await request(app)
                .post('/api/agendamentos')
                .send({
                    nome: 'Teste',
                    whatsapp: 11988887777, // número ao invés de string
                    servico: 'facial'
                });

            expect(response.status).toBe(400);
            expect(response.body.mensagem).toBe('Número de WhatsApp inválido.');
        });
    });

    // ────────────────────────────────────────────────
    // GET /api/agendamentos — Listar (rota protegida)
    // ────────────────────────────────────────────────
    describe('GET /api/agendamentos', () => {
        test('deve retornar lista de agendamentos para admin autenticado', async () => {
            // Prepara dados
            const cliente = await Cliente.create({
                nome: 'Ana Lima',
                whatsapp: '11955554444',
                dataNascimento: '1995-03-10'
            });
            await Agendamento.create({
                clienteId: cliente._id,
                servico: 'facial',
                queixa: 'Preenchimento'
            });

            const response = await request(app)
                .get('/api/agendamentos')
                .set('x-access-token', token);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].nome).toBe('Ana Lima');
            expect(response.body[0].whatsapp).toBe('11955554444');
            expect(response.body[0].servico).toBe('facial');
        });

        test('deve tratar agendamento com cliente deletado (populate null)', async () => {
            // Cria agendamento com um ObjectId inválido/deletado
            const idFake = new mongoose.Types.ObjectId();
            await Agendamento.create({
                clienteId: idFake,
                servico: 'corporal',
                queixa: 'Drenagem'
            });

            const response = await request(app)
                .get('/api/agendamentos')
                .set('x-access-token', token);

            expect(response.status).toBe(200);
            expect(response.body[0].nome).toBe('Cliente Excluído');
            expect(response.body[0].whatsapp).toBe('N/A');
        });

        test('deve negar acesso sem token (403)', async () => {
            const response = await request(app).get('/api/agendamentos');
            expect(response.status).toBe(403);
        });
    });

    // ────────────────────────────────────────────────
    // PATCH /api/agendamentos/:id — Atualizar status
    // ────────────────────────────────────────────────
    describe('PATCH /api/agendamentos/:id', () => {
        test('deve atualizar status de Pendente para Confirmado', async () => {
            const cliente = await Cliente.create({ nome: 'Pedro', whatsapp: '11944443333' });
            const ag = await Agendamento.create({
                clienteId: cliente._id,
                servico: 'facial',
                queixa: 'Botox',
                status: 'Pendente'
            });

            const response = await request(app)
                .patch(`/api/agendamentos/${ag._id}`)
                .set('x-access-token', token)
                .send({ status: 'Confirmado' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('Confirmado');
        });

        test('deve retornar 404 para id inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();

            const response = await request(app)
                .patch(`/api/agendamentos/${idFake}`)
                .set('x-access-token', token)
                .send({ status: 'Confirmado' });

            expect(response.status).toBe(404);
        });

        test('deve negar atualização sem token (403)', async () => {
            const idFake = new mongoose.Types.ObjectId();
            const response = await request(app)
                .patch(`/api/agendamentos/${idFake}`)
                .send({ status: 'Confirmado' });

            expect(response.status).toBe(403);
        });
    });

    // ────────────────────────────────────────────────
    // DELETE /api/agendamentos/:id — Deletar
    // ────────────────────────────────────────────────
    describe('DELETE /api/agendamentos/:id', () => {
        test('deve deletar agendamento existente', async () => {
            const cliente = await Cliente.create({ nome: 'Luiza', whatsapp: '11933332222' });
            const ag = await Agendamento.create({
                clienteId: cliente._id,
                servico: 'facial',
                queixa: 'Limpeza de Pele'
            });

            const response = await request(app)
                .delete(`/api/agendamentos/${ag._id}`)
                .set('x-access-token', token);

            expect(response.status).toBe(200);
            expect(response.body.mensagem).toBe('Agendamento removido!');

            const busca = await Agendamento.findById(ag._id);
            expect(busca).toBeNull();
        });

        test('deve retornar 404 ao deletar id inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/agendamentos/${idFake}`)
                .set('x-access-token', token);

            expect(response.status).toBe(404);
        });
    });
});
