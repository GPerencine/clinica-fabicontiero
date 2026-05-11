import React from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';

export default function FichaClienteModal({
  clienteSelecionado,
  setClienteSelecionado,
  notasFabi,
  setNotasFabi,
  salvarNotas,
  alterarStatusHistorico,
  excluirAgendamento,
  excluirClienteCompleto,
  formatWhatsApp
}) {
  if (!clienteSelecionado) return null;

  return (
    <motion.div 
      className="modal-overlay" 
      onClick={() => setClienteSelecionado(null)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="ficha-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
      >
        <button className="btn-fechar-ficha" onClick={() => setClienteSelecionado(null)}>
          <X size={24} />
        </button>
        <div className="ficha-header">
          <div className="avatar-gold">{clienteSelecionado.cliente.nome?.charAt(0)}</div>
          <h2>{clienteSelecionado.cliente.nome}</h2>
          <div className="zap-container-modal">
            <span className="zap-sub">{formatWhatsApp(clienteSelecionado.cliente.whatsapp)}</span>
            <button className="btn-excluir-cadastro" onClick={() => excluirClienteCompleto(clienteSelecionado.cliente._id, clienteSelecionado.cliente.nome)}>Excluir Cadastro</button>
          </div>
        </div>
        <div className="ficha-content">
          <div className="anotacoes-secao">
            <h3>Anotações da Fabi</h3>
            <textarea 
              className="anotacoes-textarea" 
              value={notasFabi} 
              onChange={(e) => setNotasFabi(e.target.value)}
              placeholder="Escreva detalhes sobre o cliente, alergias, histórico..."
            ></textarea>
            <button className="btn-salvar-notas" onClick={salvarNotas}>Salvar Anotações</button>
          </div>

          <h3>Histórico de Consultas</h3>
          <div className="historico-lista">
            {clienteSelecionado.historico.map(h => (
              <div className="historico-card" key={h._id}>
                <div className="h-card-header">
                  <strong>{h.queixa}</strong>
                  <div className="h-card-actions">
                    <select className="select-status" style={{fontSize: '0.8rem', padding: '2px 5px', height: 'auto'}} value={h.status} onChange={(e) => alterarStatusHistorico(h._id, e.target.value)}>
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                    <button className="btn-delete-icon" onClick={(e) => excluirAgendamento(e, h._id, h.queixa)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p>{new Date(h.dataCriacao).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

FichaClienteModal.propTypes = {
  clienteSelecionado: PropTypes.shape({
    cliente: PropTypes.shape({
      _id: PropTypes.string,
      nome: PropTypes.string,
      whatsapp: PropTypes.string,
    }),
    historico: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        queixa: PropTypes.string,
        status: PropTypes.string,
        dataCriacao: PropTypes.string,
      })
    ),
  }),
  setClienteSelecionado: PropTypes.func.isRequired,
  notasFabi: PropTypes.string,
  setNotasFabi: PropTypes.func.isRequired,
  salvarNotas: PropTypes.func.isRequired,
  alterarStatusHistorico: PropTypes.func.isRequired,
  excluirAgendamento: PropTypes.func.isRequired,
  excluirClienteCompleto: PropTypes.func.isRequired,
  formatWhatsApp: PropTypes.func.isRequired,
};
