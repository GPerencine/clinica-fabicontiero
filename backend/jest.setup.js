/**
 * Jest Setup — Variáveis de ambiente para o ambiente de teste.
 * Este arquivo é executado ANTES de qualquer teste e module import,
 * garantindo que as variáveis críticas estejam disponíveis.
 */

// Chave JWT para os testes — isolada do ambiente de produção
process.env.SECRET_KEY = 'test-secret-key-for-jest-environment-only';

// Garante que o ambiente é test para desabilitar a conexão real ao MongoDB
process.env.NODE_ENV = 'test';

// URL base fictícia (necessária para URLs de imagem nos testes)
process.env.BASE_URL = 'http://localhost:3002';

// Chave diferente para testar rejeição de tokens externos (não deve bater com SECRET_KEY)
process.env.WRONG_SECRET_KEY_FOR_TEST = 'different-key-used-only-in-tests-to-verify-rejection';
