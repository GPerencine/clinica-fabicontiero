import React, { useState } from 'react';
import api from '../api';
import './Login.css';

function Login() {
  const [credenciais, setCredenciais] = useState({ usuario: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/auth/check-session')
        .then(res => { if (res.data.auth) window.location.replace('/dashboard'); })
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const response = await api.post('/api/auth/login', {
        usuario: credenciais.usuario,
        senha: credenciais.senha
      });
      if (response.data.auth) {
        localStorage.setItem('token', response.data.token);
        window.location.replace('/dashboard');
      }
    } catch (error) {
      const msgErro = error.response?.data?.mensagem || error.response?.data?.erro || 'Usuário ou senha incorretos.';
      setErro(msgErro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-layout">
      {/* ── LEFT: Branding Panel ── */}
      <div className="login-left">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />

        <div className="login-left-inner">
          <h1 className="login-brand-name">FABI CONTIERO</h1>
          <span className="login-brand-tagline">Estética Avançada</span>

          <div className="login-divider" />

          <p className="login-quote">
            "Acreditamos que a verdadeira beleza reside na harmonia e na confiança de cada pessoa."
          </p>

        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <span className="login-welcome-tag">Área Administrativa</span>
            <h2 className="login-form-title">Bem-vinda,<br />Fabi!</h2>
            <p className="login-form-subtitle">Acesso restrito ao painel de gestão da clínica</p>
          </div>

          {erro && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Usuário</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  className="login-input"
                  placeholder="ex: fabi"
                  value={credenciais.usuario}
                  onChange={(e) => setCredenciais({ ...credenciais, usuario: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={credenciais.senha}
                  onChange={(e) => setCredenciais({ ...credenciais, senha: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-entrar" disabled={carregando}>
              <span>
                {carregando ? 'Verificando...' : 'Entrar no Painel'}
              </span>
            </button>
          </form>

          <div className="login-footer">
            <a href="/">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Voltar para o site público
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;