# Clínica Fabi Contiero

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![SonarQube](https://img.shields.io/badge/Quality-SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

**Plataforma Full-Stack Serverless para gestão de agendamentos de clínica de estética.**  
[🔗 Site Oficial](https://fabicontiero.vercel.app/)

</div>

---

## Sobre o Projeto

Sistema desenvolvido para substituir o agendamento manual da **Clínica Fabi Contiero** por um fluxo digital completo e de alta performance, projetado com uma arquitetura moderna serverless:

- **Site Público** — Landing page performática, catálogo de serviços e formulário de agendamento integrado via WhatsApp. Analisada em tempo real pelo **Vercel Speed Insights** e **Vercel Analytics**.
- **Painel Administrativo** — Gestão de agendamentos, fichas de clientes, histórico de consultas e métricas gerenciais, protegido por autenticação JWT rigorosa.

---

## Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| Backend (API) | Node.js, Express, Mongoose, JWT, bcryptjs, Helmet (Rodando como **Vercel Serverless Functions**) |
| Frontend | React 19, React Router 7, Axios, Framer Motion, Chart.js, Vercel Analytics |
| Banco de Dados | MongoDB Atlas (Cluster Nuvem) |
| Testes | Jest, Supertest, mongodb-memory-server |
| Qualidade de Código | SonarQube Cloud (Quality Gate Integrado) |
| Infraestrutura/DevOps | GitHub Actions (CI/CD Automatizado), Vercel |

---

## Arquitetura e Deploy

O projeto está dividido em duas frentes independentes que convergem na mesma plataforma de infraestrutura:

```text
clinica-estetica/
├── backend/          # API RESTful serverless (/api/*)
└── frontend/         # Aplicação React otimizada
```

**Estratégia de Deploy (Vercel):**
- O frontend é servido na raiz do domínio e construído através do comando padrão de build do React.
- O backend atua através de **Serverless Functions** interceptando todas as rotas de API definidas no arquivo `vercel.json`.

---

## Rodando Localmente

```bash
# Clone o repositório
git clone https://github.com/GPerencine/clinica-fabicontiero.git

# Configuração do Backend
cd backend 
npm install 
cp .env.example .env
npm run dev   # Executa a API local em http://localhost:3001

# Configuração do Frontend (Em outro terminal)
cd frontend 
npm install 
npm start     # Inicia a interface em http://localhost:3000

# Popular o banco (Criar primeiro usuário admin)
cd backend && node seedAdmin.js
```

### Variáveis de Ambiente Necessárias

**`backend/.env`**
```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/clinica
SECRET_KEY=chave_jwt_secreta_super_forte
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**`frontend/.env`**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps
```

---

## Testes e Qualidade

O projeto possui rigor na entrega, validado através de fluxos contínuos.

- **Testes Automatizados:** Suíte com testes de integração simulando banco em memória. (Comando: `npm test` no backend).
- **Code Quality:** Integração oficial com **SonarQube Cloud** via GitHub Actions, com validações de Reliability (Bugs), Security (Vulnerabilidades) e Maintainability (Code Smells).
- **Performance de Produção:** Monitoramento constante de Web Vitals através do Speed Insights.

---

## Segurança e Performance

- Prevenção ativa de Cross-Origin (CORS Restrito a URLs de produção confiáveis).
- Headers HTTP protegidos pelo Helmet e edge headers da Vercel (`vercel.json`).
- JWT HS256 para o painel admin (expiração em 8h).
- Senhas protegidas via bcrypt (Cost 10).
- Dados do Mongo operando sob SSL e replica sets.

---

## Licença

Desenvolvido sob contrato para uso privado da Clínica Fabi Contiero. Disponibilizado para fins de portfólio de engenharia de software e arquitetura.

---

<div align="center">Desenvolvido por <strong>Gabriel Perencine</strong></div>