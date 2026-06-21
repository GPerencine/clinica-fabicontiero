import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, RefreshCw, Sparkles } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

function PainelMetricas({
  periodoFiltro,
  setPeriodoFiltro,
  clientesCount,
  metrics,
  chartStatusData,
  chartServicosData
}) {
  return (
    <motion.div 
      key="metrics"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <header className="dash-header">
        <div>
          <h1>Análise de Dados</h1>
          <p>Métricas de desempenho e volume de clientes</p>
        </div>
        <div className="periodo-selector">
          <button className={periodoFiltro === 'Hoje' ? 'active' : ''} onClick={() => setPeriodoFiltro('Hoje')}>Hoje</button>
          <button className={periodoFiltro === '7' ? 'active' : ''} onClick={() => setPeriodoFiltro('7')}>7 Dias</button>
          <button className={periodoFiltro === '30' ? 'active' : ''} onClick={() => setPeriodoFiltro('30')}>30 Dias</button>
          <button className={periodoFiltro === 'Total' ? 'active' : ''} onClick={() => setPeriodoFiltro('Total')}>Total</button>
        </div>
      </header>

      <div className="stats-cards">
        <div className="stat-card">
          <Users className="card-icon" size={24} />
          <span>Total de Clientes</span>
          <h3 className="gold-text">{clientesCount}</h3>
        </div>
        <div className="stat-card">
          <BarChart3 className="card-icon" size={24} />
          <span>Faturamento Estimado</span>
          <h3 className="gold-text">R$ {metrics.faturamentoTotal.toLocaleString('pt-BR')}</h3>
          <small style={{fontSize: '0.7rem', color: '#888'}}>Leads finalizados</small>
        </div>
        <div className="stat-card">
          <RefreshCw className="card-icon" size={24} />
          <span>Ticket Médio</span>
          <h3>R$ {Math.round(metrics.ticketMedio).toLocaleString('pt-BR')}</h3>
        </div>
        <div className="stat-card">
          <Sparkles className="card-icon" size={24} />
          <span>Conversão</span>
          <h3 className="gold-text">
            {metrics.totalNoPeriodo > 0 ? Math.round((metrics.statusCount.Finalizado / metrics.totalNoPeriodo) * 100) : 0}%
          </h3>
          <small style={{fontSize: '0.7rem', color: '#888'}}>{metrics.statusCount.Finalizado} de {metrics.totalNoPeriodo}</small>
        </div>
      </div>

      <div className="charts-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
        <div className="stat-card chart-card">
          <h3>Distribuição de Status</h3>
          <div style={{height: '300px'}}>
            <Bar 
              data={chartStatusData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }} 
            />
          </div>
        </div>
        <div className="stat-card chart-card">
          <h3>Serviços Mais Procurados</h3>
          <div style={{height: '300px'}}>
            <Doughnut 
              data={chartServicosData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

PainelMetricas.propTypes = {
  periodoFiltro: PropTypes.string.isRequired,
  setPeriodoFiltro: PropTypes.func.isRequired,
  clientesCount: PropTypes.number.isRequired,
  metrics: PropTypes.shape({
    faturamentoTotal: PropTypes.number,
    ticketMedio: PropTypes.number,
    totalNoPeriodo: PropTypes.number,
    statusCount: PropTypes.object,
  }).isRequired,
  chartStatusData: PropTypes.object.isRequired,
  chartServicosData: PropTypes.object.isRequired,
};

export default React.memo(PainelMetricas);
