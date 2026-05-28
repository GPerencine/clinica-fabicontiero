# Documento de Requisitos do Produto (PRD) e Plano de Testes

## 1. Visão Geral do Projeto
**Nome do Projeto:** Clínica Fabi Contiero
**Descrição:** Plataforma full-stack serverless para gestão de agendamentos de uma clínica de estética. O sistema visa digitalizar o fluxo de agendamentos substituindo processos manuais por uma plataforma moderna, composta por um site público e um painel administrativo.

## 2. Arquitetura e Stack Tecnológico
- **Frontend:** React 19, React Router 7, Axios, Framer Motion, Chart.js.
- **Backend:** Node.js 18+, Express 5, Mongoose, JWT, bcryptjs, Helmet (API RESTful via Vercel Serverless Functions).
- **Banco de Dados:** MongoDB Atlas.
- **Deploy:** Vercel.
- **Testes Atuais:** Jest, Supertest, mongodb-memory-server.

## 3. Funcionalidades Principais (Escopo)
- **Site Público:** Landing page, catálogo de serviços e formulário público de agendamento integrado diretamente ao WhatsApp.
- **Painel Administrativo:** Gestão de agendamentos, fichas de clientes, histórico de consultas e métricas gerenciais.
- **Autenticação:** Acesso protegido para administradores utilizando JWT e bcrypt.
- **Segurança:** CORS restrito, Helmet, SSL MongoDB, headers protegidos.

## 4. Estratégia e Cenários de Testes

Este PRD tem como foco guiar as atividades de qualidade (QA) e desenvolvimento de testes automatizados e manuais.

### 4.1. Testes de Frontend (Interface e Usabilidade)
- **Site Público:**
  - Validar a renderização da Landing Page em diferentes resoluções (Responsividade).
  - Testar o fluxo do formulário de agendamento (validação de campos obrigatórios).
  - Verificar o redirecionamento correto para o WhatsApp com a mensagem pré-formatada.
- **Painel Administrativo:**
  - Testar fluxo de login (credenciais válidas e inválidas).
  - Verificar navegação interna protegida (redirecionamento caso não esteja autenticado).
  - Validar renderização de gráficos de métricas (Chart.js) com dados mockados.
  - Testar a criação, edição e exclusão de fichas de clientes e agendamentos.

### 4.2. Testes de Backend (API e Integração)
- **Autenticação (`/api/auth`):**
  - Gerar token JWT válido ao realizar login com sucesso.
  - Bloquear acesso a rotas protegidas sem token ou com token expirado/inválido.
- **Agendamentos (`/api/agendamentos`):**
  - Criar um novo agendamento com sucesso.
  - Validar erro ao tentar criar agendamento com dados incompletos.
  - Listar agendamentos existentes (com paginação/filtros, se aplicável).
- **Clientes e Serviços (`/api/clientes`, `/api/servicos`):**
  - Realizar operações de CRUD (Create, Read, Update, Delete) garantindo a persistência correta no banco (usando `mongodb-memory-server` para testes isolados).
  - Verificar regras de negócio, como não permitir a deleção de um serviço vinculado a agendamentos futuros (caso a regra exista).

### 4.3. Testes de Segurança e Performance
- **Segurança:**
  - Validar se os headers de segurança do Helmet estão presentes nas requisições.
  - Tentar ataques básicos de injeção (NoSQL Injection) nas rotas de API.
  - Confirmar que senhas nunca são retornadas nas respostas da API.
- **Performance:**
  - Verificar tempo de resposta das Serverless Functions.
  - Auditar o frontend utilizando o Lighthouse (focando no Core Web Vitals).

## 5. Critérios de Aceite para Cobertura de Testes
- Mínimo de 80% de cobertura de código para regras de negócio críticas (autenticação e fluxos de agendamento).
- Pipeline de CI/CD (GitHub Actions e SonarQube Cloud) configurada para bloquear merges que quebrem testes ou reduzam a cobertura para baixo do limite.
