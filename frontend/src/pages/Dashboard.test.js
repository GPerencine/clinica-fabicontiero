import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import api from '../api';

// Mock das libs e componentes
jest.mock('../api');
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  ArcElement: {}, Tooltip: {}, Legend: {}, CategoryScale: {}, LinearScale: {}, BarElement: {}
}));
jest.mock('../components/dashboard/PainelAgendamentos', () => () => <div data-testid="painel-agendamentos">PainelAgendamentos</div>);
jest.mock('../components/dashboard/PainelMetricas', () => () => <div>PainelMetricas</div>);
jest.mock('../components/dashboard/FichaClienteModal', () => () => <div>FichaClienteModal</div>);

describe('Componente Dashboard - Middleware de Autenticação', () => {
  let locationReplaceMock;

  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn();
    
    // Configura o mock do globalThis.location.replace
    locationReplaceMock = jest.fn();
    delete global.window.location;
    global.window = Object.create(window);
    global.window.location = { replace: locationReplaceMock };
    global.globalThis.location = { replace: locationReplaceMock };
  });

  test('Redireciona para /login se não houver token no localStorage', async () => {
    Storage.prototype.getItem.mockReturnValue(null);

    render(<Dashboard />);

    await waitFor(() => {
      expect(locationReplaceMock).toHaveBeenCalledWith('/login');
    });
  });

  test('Permanece no Dashboard se token for válido', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');
    
    // Mock das chamadas de API feitas no buscarDados
    api.get.mockImplementation((url) => {
      if (url === '/api/agendamentos') return Promise.resolve({ data: [] });
      if (url === '/api/clientes') return Promise.resolve({ data: [] });
      if (url === '/api/servicos') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('not found'));
    });

    const { getByTestId } = render(<Dashboard />);

    await waitFor(() => {
      expect(locationReplaceMock).not.toHaveBeenCalled();
      expect(getByTestId('painel-agendamentos')).toBeTruthy();
    });
  });

  test('Redireciona para /login se API retornar 401/403 (token expirado/inválido)', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-expired-token');
    Storage.prototype.removeItem = jest.fn();

    api.get.mockRejectedValueOnce({
      response: { status: 401 }
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('token');
      expect(locationReplaceMock).toHaveBeenCalledWith('/login');
    });
  });
});
