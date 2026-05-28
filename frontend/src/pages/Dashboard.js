/* global globalThis */
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
// Unused chart imports removed
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  BarChart3, 
  Sparkles, 
  LogOut, 
  RefreshCw, 
  FileText,
  Menu,
  X
} from 'lucide-react';
import './Dashboard.css';
import GerenciarServicos from './GerenciarServicos';
import GerenciarConteudo from './GerenciarConteudo';
import PainelAgendamentos from '../components/dashboard/PainelAgendamentos';
import PainelMetricas from '../components/dashboard/PainelMetricas';
import FichaClienteModal from '../components/dashboard/FichaClienteModal';
import { agruparClientes, calcularMetricas, formatWhatsApp, abrirWhatsAppAction } from '../utils/dashboardUtils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


function Dashboard() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [agendamentos, setAgendamentos] = useState([]);
  const [clientesCount, setClientesCount] = useState(0);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [notasFabi, setNotasFabi] = useState('');
  const token = localStorage.getItem('token');
  const [abaAtiva, setAbaAtiva] = useState('agendamentos');
  const [loading, setLoading] = useState(true);
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [periodoFiltro, setPeriodoFiltro] = useState('Total'); // 'Hoje', '7', '30', 'Total'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState({ aberto: false, titulo: '', mensagem: '', acaoConfirmar: null });
  const [textoConfirmacao, setTextoConfirmacao] = useState('');

  const buscarDados = useCallback(async () => {
    if (!token) {
      globalThis.location.replace("/login");
      return;
    }
    try {
      setLoading(true);
      // O interceptor do api.js injeta o token automaticamente
      const [respAg, respCl, respSv] = await Promise.all([
        api.get('/api/agendamentos'),
        api.get('/api/clientes'),
        api.get('/api/servicos')
      ]);
      
      setAgendamentos(respAg.data);
      setClientesCount(respCl.data.length);
      setServicosDisponiveis(respSv.data);
      
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        globalThis.location.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const alterarStatusHistorico = async (id, novoStatus) => {
    try {
      await api.patch(`/api/agendamentos/${id}`, { status: novoStatus });
      setClienteSelecionado(prev => ({
          ...prev,
          historico: prev.historico.map(h => h._id === id ? {...h, status: novoStatus} : h)
      }));
      buscarDados();
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar status.", "error");
    }
  };

  const abrirWhatsApp = (e, numero, nome, procedimento) => {
    e.stopPropagation(); 
    const result = abrirWhatsAppAction(numero, nome, procedimento);
    if (result.error) showToast(result.error, "error");
  };

  const verFichaCliente = async (whatsapp) => {
    if (!whatsapp || whatsapp === "N/A") return;
    try {
        const resp = await api.get(`/api/clientes/${whatsapp}/historico`);
        setClienteSelecionado(resp.data);
        setNotasFabi(resp.data.cliente.anotacoes || '');
    } catch (err) {
        console.error('Erro ao carregar ficha do cliente:', err);
        showToast("Erro ao carregar ficha do cliente.", "error");
    }
  };

  const salvarNotas = async () => {
    if (!clienteSelecionado) return;
    try {
        await api.put(`/api/clientes/${clienteSelecionado.cliente._id}/anotacoes`, { anotacoes: notasFabi });
        showToast("Notas salvas com sucesso!");
    } catch (err) {
        console.error('Erro ao salvar notas:', err);
        showToast("Erro ao salvar notas.", "error");
    }
  };

  const excluirAgendamento = async (e, id, procedimento) => {
    e.stopPropagation();
    setModalConfirmacao({
      aberto: true,
      titulo: 'Excluir Agendamento',
      mensagem: `AVISO: Excluir permanentemente o pedido de '${procedimento}'?\nDigite 'deletar' para confirmar:`,
      acaoConfirmar: async () => {
        try {
            await api.delete(`/api/agendamentos/${id}`);
            setClienteSelecionado(null);
            buscarDados();
            showToast("Excluído com sucesso.");
        } catch (err) {
            console.error(err);
            showToast("Erro ao excluir.", "error");
        }
      }
    });
  };

  const excluirClienteCompleto = async (idCliente, nomeCliente) => {
      setModalConfirmacao({
          aberto: true,
          titulo: 'Excluir Cliente',
          mensagem: `Isso apagará TODO o histórico de ${nomeCliente}.\nDigite 'deletar' para confirmar:`,
          acaoConfirmar: async () => {
              try {
                  await api.delete(`/api/clientes/${idCliente}`);
                  setClienteSelecionado(null);
                  buscarDados();
                  showToast("Cliente removido!");
              } catch (err) {
                  console.error(err);
                  showToast("Erro ao excluir cliente.", "error");
              }
          }
      });
  };

  const clientesAgrupados = React.useMemo(() => {
    return agruparClientes(agendamentos, busca, filtroStatus);
  }, [agendamentos, busca, filtroStatus]);

  // Preparando dados para gráficos com useMemo para performance
  const metrics = React.useMemo(() => {
    return calcularMetricas(agendamentos, periodoFiltro, servicosDisponiveis);
  }, [agendamentos, periodoFiltro, servicosDisponiveis]);

  const chartStatusData = React.useMemo(() => ({
    labels: ['Pendente', 'Confirmado', 'Finalizado', 'Cancelado'],
    datasets: [{
      label: 'Qtd de Agendamentos',
      data: [metrics.statusCount.Pendente, metrics.statusCount.Confirmado, metrics.statusCount.Finalizado, metrics.statusCount.Cancelado],
      backgroundColor: ['#e6be94', '#d4a373', '#a67c52', '#888888'],
      borderRadius: 8
    }]
  }), [metrics]);

  const chartServicosData = React.useMemo(() => {
    const topServicosKeys = Object.keys(metrics.servicoCount).sort((a,b) => metrics.servicoCount[b] - metrics.servicoCount[a]).slice(0, 5);
    return {
      labels: topServicosKeys.length > 0 ? topServicosKeys : ['Nenhum'],
      datasets: [{
        data: topServicosKeys.length > 0 ? topServicosKeys.map(k => metrics.servicoCount[k]) : [1],
        backgroundColor: ['#d4a373', '#e6be94', '#a67c52', '#f9f6f2', '#888888'],
        borderColor: '#ffffff',
        borderWidth: 2,
      }]
    };
  }, [metrics]);

  return (
    <div className={`admin-layout ${mobileMenuOpen ? 'menu-open' : ''}`}>
      {/* Overlay para fechar menu no mobile */}
      {mobileMenuOpen && (
        <div 
          className="admin-overlay" 
          onClick={() => setMobileMenuOpen(false)} 
          role="button" 
          tabIndex={0} 
          onKeyDown={(e) => { if (e.key === 'Enter') setMobileMenuOpen(false); }} 
        />
      )}

      {/* Botão Hamburger Mobile */}
      <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <h2 className="sidebar-logo">FABI CONTIERO</h2>
        <nav className="admin-nav">
          <button 
            className={`nav-btn ${abaAtiva === 'agendamentos' ? 'active' : ''}`} 
            onClick={() => { setAbaAtiva('agendamentos'); setMobileMenuOpen(false); }}
          >
            <Calendar size={20} className="icon" /> <span>Agendamentos</span>
          </button>
          <button 
            className={`nav-btn ${abaAtiva === 'graficos' ? 'active' : ''}`} 
            onClick={() => { setAbaAtiva('graficos'); setMobileMenuOpen(false); }}
          >
            <BarChart3 size={20} className="icon" /> <span>Métricas</span>
          </button>
          <button 
            className={`nav-btn ${abaAtiva === 'servicos' ? 'active' : ''}`} 
            onClick={() => { setAbaAtiva('servicos'); setMobileMenuOpen(false); }}
          >
            <Sparkles size={20} className="icon" /> <span>Serviços</span>
          </button>
          <button 
            className={`nav-btn ${abaAtiva === 'conteudo' ? 'active' : ''}`} 
            onClick={() => { setAbaAtiva('conteudo'); setMobileMenuOpen(false); }}
          >
            <FileText size={20} className="icon" /> <span>Conteúdo</span>
          </button>
        </nav>
        <button className="btn-logout" onClick={() => { localStorage.clear(); globalThis.location.href = "/login"; }}>
          <LogOut size={20} style={{marginRight: '8px'}} /> Sair
        </button>
      </aside>

      <main className="admin-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              className="loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RefreshCw className="spinner" size={48} />
              <p>Carregando dados...</p>
            </motion.div>
          ) : (
            <div className="dashboard-content-tabs">
              {abaAtiva === 'agendamentos' && (
                <PainelAgendamentos 
                  buscarDados={buscarDados}
                  busca={busca}
                  setBusca={setBusca}
                  filtroStatus={filtroStatus}
                  setFiltroStatus={setFiltroStatus}
                  clientesAgrupados={clientesAgrupados}
                  agendamentos={agendamentos}
                  verFichaCliente={verFichaCliente}
                  abrirWhatsApp={abrirWhatsApp}
                  formatWhatsApp={formatWhatsApp}
                />
              )}

              {abaAtiva === 'graficos' && (
                <PainelMetricas 
                  periodoFiltro={periodoFiltro}
                  setPeriodoFiltro={setPeriodoFiltro}
                  clientesCount={clientesCount}
                  metrics={metrics}
                  chartStatusData={chartStatusData}
                  chartServicosData={chartServicosData}
                />
              )}

              {abaAtiva === 'servicos' && (
                <motion.div 
                  key="servicos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GerenciarServicos />
                </motion.div>
              )}

              {abaAtiva === 'conteudo' && (
                <motion.div 
                  key="conteudo"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GerenciarConteudo />
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        <FichaClienteModal 
          clienteSelecionado={clienteSelecionado}
          setClienteSelecionado={setClienteSelecionado}
          notasFabi={notasFabi}
          setNotasFabi={setNotasFabi}
          salvarNotas={salvarNotas}
          alterarStatusHistorico={alterarStatusHistorico}
          excluirAgendamento={excluirAgendamento}
          excluirClienteCompleto={excluirClienteCompleto}
          formatWhatsApp={formatWhatsApp}
        />
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`admin-toast ${toast.type}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {modalConfirmacao.aberto && (
        <div className="sm-confirm-overlay" style={{ zIndex: 9999 }}>
          <div className="sm-confirm-box">
            <h4>{modalConfirmacao.titulo}</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{modalConfirmacao.mensagem}</p>
            <input 
              type="text" 
              style={{ width: '100%', marginBottom: '20px', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', fontSize: '1rem' }}
              placeholder="Digite 'deletar'" 
              value={textoConfirmacao} 
              onChange={(e) => setTextoConfirmacao(e.target.value)} 
            />
            <div className="sm-confirm-actions">
              <button 
                className="sm-btn-cancel" 
                onClick={() => { setModalConfirmacao({ aberto: false }); setTextoConfirmacao(''); }}
              >
                Cancelar
              </button>
              <button 
                className="sm-btn-danger" 
                disabled={textoConfirmacao !== 'deletar'}
                style={{ opacity: textoConfirmacao !== 'deletar' ? 0.5 : 1 }}
                onClick={() => {
                  modalConfirmacao.acaoConfirmar();
                  setModalConfirmacao({ aberto: false });
                  setTextoConfirmacao('');
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;