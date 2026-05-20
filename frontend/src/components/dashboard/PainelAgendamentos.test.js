import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PainelAgendamentos from './PainelAgendamentos';

describe('Componente PainelAgendamentos', () => {
  const mockProps = {
    buscarDados: jest.fn(),
    busca: '',
    setBusca: jest.fn(),
    filtroStatus: 'Todos',
    setFiltroStatus: jest.fn(),
    clientesAgrupados: [
      {
        whatsapp: '5511999999999',
        nome: 'Maria Silva',
        agendamentos: [{}],
        ultimoProcedimento: { dataCriacao: '2026-05-20T10:00:00Z', queixa: 'Botox' },
        statusPrioritario: 'Confirmado'
      }
    ],
    agendamentos: [
      { status: 'Confirmado', dataCriacao: new Date().toISOString() }
    ],
    verFichaCliente: jest.fn(),
    abrirWhatsApp: jest.fn(),
    formatWhatsApp: (num) => num
  };

  test('Renderiza a lista de agendamentos corretamente', () => {
    render(<PainelAgendamentos {...mockProps} />);
    
    // Verifica elementos do cabeçalho
    expect(screen.getByText('Painel de Agendamentos')).toBeTruthy();
    
    // Verifica se o cliente da prop "clientesAgrupados" está sendo renderizado
    expect(screen.getByText('Maria Silva')).toBeTruthy();
    expect(screen.getAllByText('Confirmado').length).toBeGreaterThan(0);
  });

  test('Mostra mensagem quando não há agendamentos', () => {
    const emptyProps = { ...mockProps, clientesAgrupados: [] };
    render(<PainelAgendamentos {...emptyProps} />);
    
    expect(screen.getByText('Nenhum registro encontrado.')).toBeTruthy();
  });
});
