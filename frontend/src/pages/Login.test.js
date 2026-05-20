import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import api from '../api';

// Mock do axios/api
jest.mock('../api');

describe('Componente Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    
    // Configura um mock pro location.replace
    delete global.window.location;
    global.window = Object.create(window);
    global.window.location = {
      replace: jest.fn()
    };
  });

  test('Renderiza o formulário de login corretamente', () => {
    render(<Login />);
    
    expect(screen.getByText('Área Administrativa')).toBeTruthy();
    expect(screen.getByPlaceholderText('ex: fabi')).toBeTruthy();
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
    expect(screen.getByRole('button', { name: /entrar no painel/i })).toBeTruthy();
  });

  test('Mostra erro se a requisição de login falhar (credenciais inválidas)', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { erro: 'Usuário ou senha incorretos.' } }
    });

    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('ex: fabi'), { target: { value: 'wrong_user' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong_password' } });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar no painel/i }));

    await waitFor(() => {
      expect(screen.getByText('Usuário ou senha incorretos.')).toBeTruthy();
    });
  });

  test('Realiza login com sucesso e redireciona (credenciais válidas)', async () => {
    api.post.mockResolvedValueOnce({
      data: { auth: true, token: 'fake-jwt-token' }
    });

    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('ex: fabi'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'senha123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar no painel/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token');
      expect(window.location.replace).toHaveBeenCalledWith('/dashboard');
    });
  });
});
