import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Search, MessageCircle } from 'lucide-react';
import PropTypes from 'prop-types';

function PainelAgendamentos({
  buscarDados,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  clientesAgrupados,
  agendamentos,
  verFichaCliente,
  abrirWhatsApp,
  formatWhatsApp
}) {
  return (
    <motion.div 
      key="agendamentos"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="dash-header">
        <div>
          <h1>Painel de Agendamentos</h1>
          <p>Gerencie seus leads e agendamentos em tempo real</p>
        </div>
        <button className="btn-refresh" onClick={buscarDados}>
          <RefreshCw size={16} style={{marginRight: '8px'}} /> Atualizar Lista
        </button>
      </header>

      <div className="filter-bar">
        <div className="search-container" style={{flex: 1, position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888'}} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou WhatsApp..." 
            className="search-input" 
            style={{paddingLeft: '45px'}}
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
          />
        </div>
        <select className="filter-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Todos">Todos os Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span>Resultados</span>
          <h3>{clientesAgrupados.length}</h3>
        </div>
        <div className="stat-card">
          <span>Agendados Hoje</span>
          <h3 className="gold-text">
            {agendamentos.filter(a => {
              const hoje = new Date().toLocaleDateString('pt-BR');
              const dataAg = new Date(a.dataCriacao).toLocaleDateString('pt-BR');
              return hoje === dataAg;
            }).length}
          </h3>
        </div>
        <div className="stat-card">
          <span>Pendentes</span>
          <h3 className="gold-text">{agendamentos.filter(a => a.status === 'Pendente').length}</h3>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Agendamentos</th>
              <th>Último Procedimento</th>
              <th>Status Recente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesAgrupados.length === 0 ? (
              <tr><td colSpan="5" className="no-data">Nenhum registro encontrado.</td></tr>
            ) : (
              clientesAgrupados.map((c) => (
                <tr key={c.whatsapp} onClick={() => verFichaCliente(c.whatsapp)} className="row-clicavel">
                  <td>
                    <div className="cliente-info-wrapper">
                      <strong className="cliente-nome">{c.nome}</strong>
                      <span className="cliente-zap-subtext">{formatWhatsApp(c.whatsapp)}</span>
                    </div>
                  </td>
                  <td><span className="badge-procedimento">{c.agendamentos.length}</span></td>
                  <td>{c.ultimoProcedimento ? new Date(c.ultimoProcedimento.dataCriacao).toLocaleDateString('pt-BR') : "--"}</td>
                  <td><span className={`status-badge ${(c.statusPrioritario || 'pendente').toLowerCase()}`}>{c.statusPrioritario || 'Pendente'}</span></td>
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-zap-small" onClick={(e) => abrirWhatsApp(e, c.whatsapp, c.nome, c.ultimoProcedimento?.queixa || 'Avaliação')}>
                      <MessageCircle size={16} style={{marginRight: '6px'}} />
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

PainelAgendamentos.propTypes = {
  buscarDados: PropTypes.func.isRequired,
  busca: PropTypes.string.isRequired,
  setBusca: PropTypes.func.isRequired,
  filtroStatus: PropTypes.string.isRequired,
  setFiltroStatus: PropTypes.func.isRequired,
  clientesAgrupados: PropTypes.array.isRequired,
  agendamentos: PropTypes.array.isRequired,
  verFichaCliente: PropTypes.func.isRequired,
  abrirWhatsApp: PropTypes.func.isRequired,
  formatWhatsApp: PropTypes.func.isRequired,
};

export default React.memo(PainelAgendamentos);
