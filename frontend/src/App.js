import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Importação das Páginas com Lazy Loading
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Componente de carregamento simples
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fdf7f2', color: '#c5a089' }}>
    <p>Carregando Clínica Fabi Contiero...</p>
  </div>
);

/**
 * @component App
 * @description Central de Roteamento. Aqui definimos quais componentes 
 * aparecem em quais URLs.
 */
function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Rota Principal: O site que os clientes veem */}
            <Route path="/" element={<Home />} />

            {/* Rota de Login: Acesso secreto para a Fabi */}
            <Route path="/login" element={<Login />} />

            {/* Rota do Painel: Gestão de agendamentos e serviços */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </Router>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;