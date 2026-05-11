import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { ImagePlus, Trash2, Plus, Save, Sparkles, Star, MessageSquare, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';
import './GerenciarConteudo.css';

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ mensagem, onClose }) {
  useEffect(() => {
    if (!mensagem.texto) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [mensagem, onClose]);

  if (!mensagem.texto) return null;
  const isSuccess = mensagem.tipo === 'sucesso';
  return (
    <div className={`gc-toast ${isSuccess ? 'gc-toast--success' : 'gc-toast--error'}`}>
      {isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{mensagem.texto}</span>
      <button className="gc-toast-close" onClick={onClose}><X size={14} /></button>
    </div>
  );
}

Toast.propTypes = {
  mensagem: PropTypes.shape({
    texto: PropTypes.string,
    tipo: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired
};

Toast.defaultProps = {
  mensagem: { texto: '', tipo: '' }
};

// ── StarRating ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  return (
    <div className="gc-star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" aria-label={`Avaliar com ${n} estrelas`} onClick={() => onChange(n)} className={n <= value ? 'gc-star active' : 'gc-star'}>
          <Star size={18} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

StarRating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

// ── Main Component ─────────────────────────────────────────────────────────
function GerenciarConteudo() {
  const [activeTab, setActiveTab] = useState('essencia');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [conteudo, setConteudo] = useState({
    essencia: { titulo: '', descricao: '', topicos: [], imagemEssencia: '' },
    resultados: { titulo: '', depoimentos: [] }
  });

  const mostrarMensagem = useCallback((tipo, texto) => {
    setMensagem({ tipo, texto });
  }, []);

  const fetchConteudo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/homepage');
      if (res.data) {
        const data = {
          essencia: {
            titulo: res.data.essencia?.titulo || 'Nossa Essência',
            descricao: res.data.essencia?.descricao || '',
            topicos: res.data.essencia?.topicos || [],
            imagemEssencia: res.data.essencia?.imagemEssencia || ''
          },
          resultados: {
            titulo: res.data.resultados?.titulo || 'Resultados Reais',
            depoimentos: res.data.resultados?.depoimentos || []
          }
        };
        setConteudo(data);
        if (data.essencia.imagemEssencia) setImagePreview(data.essencia.imagemEssencia);
      }
    } catch (err) {
      console.error('Erro ao buscar conteúdo', err);
      mostrarMensagem('erro', 'Falha ao carregar conteúdo atual.');
    } finally {
      setLoading(false);
    }
  }, [mostrarMensagem]);

  useEffect(() => { fetchConteudo(); }, [fetchConteudo]);

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/api/homepage', conteudo);
      mostrarMensagem('sucesso', 'Conteúdo atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar', err);
      mostrarMensagem('erro', 'Falha ao salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  // ── Image Upload ────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      mostrarMensagem('erro', 'Imagem muito grande. Limite: 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setConteudo(prev => ({ ...prev, essencia: { ...prev.essencia, imagemEssencia: reader.result } }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setConteudo(prev => ({ ...prev, essencia: { ...prev.essencia, imagemEssencia: '' } }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Tópicos ─────────────────────────────────────────────────────────────
  const handleTopicoChange = (index, field, value) => {
    const t = [...conteudo.essencia.topicos];
    t[index] = { ...t[index], [field]: value };
    setConteudo(prev => ({ ...prev, essencia: { ...prev.essencia, topicos: t } }));
  };

  const addTopico = () => {
    setConteudo(prev => ({
      ...prev,
      essencia: { ...prev.essencia, topicos: [...prev.essencia.topicos, { titulo: '', descricao: '' }] }
    }));
  };

  const removeTopico = (index) => {
    setConteudo(prev => ({
      ...prev,
      essencia: { ...prev.essencia, topicos: prev.essencia.topicos.filter((_, i) => i !== index) }
    }));
  };

  // ── Depoimentos ─────────────────────────────────────────────────────────
  const handleDepChange = (index, field, value) => {
    const d = [...conteudo.resultados.depoimentos];
    d[index] = { ...d[index], [field]: value };
    setConteudo(prev => ({ ...prev, resultados: { ...prev.resultados, depoimentos: d } }));
  };

  const addDepoimento = () => {
    setConteudo(prev => ({
      ...prev,
      resultados: {
        ...prev.resultados,
        depoimentos: [...prev.resultados.depoimentos, { autor: '', texto: '', estrelas: 5 }]
      }
    }));
  };

  const removeDepoimento = (index) => {
    setConteudo(prev => ({
      ...prev,
      resultados: { ...prev.resultados, depoimentos: prev.resultados.depoimentos.filter((_, i) => i !== index) }
    }));
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="gc-loading">
        <div className="gc-loading-spinner" />
        <span>Carregando conteúdo...</span>
      </div>
    );
  }

  return (
    <div className="gc-root">
      <Toast mensagem={mensagem} onClose={() => setMensagem({ tipo: '', texto: '' })} />

      {/* Header */}
      <div className="gc-header">
        <div className="gc-header-info">
          <h2 className="gc-title">Conteúdo do Site</h2>
          <p className="gc-subtitle">Edite os textos e imagens exibidos na página principal</p>
        </div>
        <button className="gc-btn-save" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Tabs */}
      <div className="gc-tabs">
        <button
          className={`gc-tab ${activeTab === 'essencia' ? 'active' : ''}`}
          onClick={() => setActiveTab('essencia')}
        >
          <Sparkles size={15} />
          Nossa Essência
        </button>
        <button
          className={`gc-tab ${activeTab === 'depoimentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('depoimentos')}
        >
          <MessageSquare size={15} />
          Depoimentos
          {conteudo.resultados.depoimentos.length > 0 && (
            <span className="gc-tab-badge">{conteudo.resultados.depoimentos.length}</span>
          )}
        </button>
      </div>

      <form onSubmit={handleSave}>

        {/* ── ABA: Nossa Essência ── */}
        {activeTab === 'essencia' && (
          <div className="gc-panel">

            {/* Imagem da seção */}
            <div className="gc-section">
              <h3 className="gc-section-title">Imagem da Seção</h3>
              <p className="gc-section-desc">Foto exibida ao lado do texto "Nossa Essência" no site.</p>

              <div className="gc-image-area">
                {imagePreview ? (
                  <div className="gc-image-preview-wrap">
                    <img src={imagePreview} alt="Preview" className="gc-image-preview" />
                    <button type="button" className="gc-image-remove" onClick={removeImage}>
                      <Trash2 size={14} /> Remover foto
                    </button>
                  </div>
                ) : (
                  <button type="button" className="gc-image-dropzone" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus size={32} />
                    <span>Clique para adicionar uma foto</span>
                    <small>JPG, PNG ou WebP · Máx. 4MB</small>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  aria-label="Upload de imagem"
                  id="upload-imagem"
                />
                {imagePreview && (
                  <button type="button" className="gc-image-change" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus size={14} /> Trocar foto
                  </button>
                )}
              </div>
            </div>

            {/* Título e Descrição */}
            <div className="gc-section">
              <h3 className="gc-section-title">Texto Principal</h3>
              <div className="gc-field">
                <label className="gc-label" htmlFor="titulo-secao">Título da Seção</label>
                <input
                  id="titulo-secao"
                  className="gc-input"
                  type="text"
                  value={conteudo.essencia.titulo}
                  onChange={e => setConteudo(prev => ({ ...prev, essencia: { ...prev.essencia, titulo: e.target.value } }))}
                  required
                />
              </div>
              <div className="gc-field">
                <label className="gc-label" htmlFor="texto-apresentacao">Texto de Apresentação</label>
                <textarea
                  id="texto-apresentacao"
                  className="gc-textarea"
                  value={conteudo.essencia.descricao}
                  onChange={e => setConteudo(prev => ({ ...prev, essencia: { ...prev.essencia, descricao: e.target.value } }))}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Tópicos */}
            <div className="gc-section">
              <div className="gc-section-header">
                <div>
                  <h3 className="gc-section-title">Valores / Tópicos</h3>
                  <p className="gc-section-desc">Ex: Segurança, Naturalidade, Autoestima</p>
                </div>
                <button type="button" className="gc-btn-add" onClick={addTopico}>
                  <Plus size={15} /> Novo Tópico
                </button>
              </div>

              {conteudo.essencia.topicos.length === 0 ? (
                <div className="gc-empty">Nenhum tópico adicionado ainda.</div>
              ) : (
                <div className="gc-topics-grid">
                  {conteudo.essencia.topicos.map((topico, idx) => (
                    <div key={`topico-${idx}-${topico.titulo}`} className="gc-topic-card">
                      <div className="gc-topic-card-header">
                        <span className="gc-topic-num">#{idx + 1}</span>
                        <button type="button" className="gc-btn-icon-danger" onClick={() => removeTopico(idx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        className="gc-input gc-input--sm"
                        type="text"
                        placeholder="Título do tópico"
                        aria-label={`Título do tópico ${idx + 1}`}
                        value={topico.titulo}
                        onChange={e => handleTopicoChange(idx, 'titulo', e.target.value)}
                        required
                      />
                      <textarea
                        className="gc-textarea gc-textarea--sm"
                        placeholder="Descrição breve..."
                        aria-label={`Descrição do tópico ${idx + 1}`}
                        value={topico.descricao}
                        onChange={e => handleTopicoChange(idx, 'descricao', e.target.value)}
                        rows={2}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABA: Depoimentos ── */}
        {activeTab === 'depoimentos' && (
          <div className="gc-panel">
            <div className="gc-section">
              <div className="gc-section-header">
                <div>
                  <h3 className="gc-section-title">Título da Seção</h3>
                </div>
              </div>
              <div className="gc-field">
                <label className="gc-label" htmlFor="titulo-resultados">Título exibido no site</label>
                <input
                  id="titulo-resultados"
                  className="gc-input"
                  type="text"
                  value={conteudo.resultados.titulo}
                  onChange={e => setConteudo(prev => ({ ...prev, resultados: { ...prev.resultados, titulo: e.target.value } }))}
                  required
                />
              </div>
            </div>

            <div className="gc-section">
              <div className="gc-section-header">
                <div>
                  <h3 className="gc-section-title">Depoimentos de Clientes</h3>
                  <p className="gc-section-desc">Estes depoimentos aparecem na seção "Resultados Reais"</p>
                </div>
                <button type="button" className="gc-btn-add" onClick={addDepoimento}>
                  <Plus size={15} /> Novo Depoimento
                </button>
              </div>

              {conteudo.resultados.depoimentos.length === 0 ? (
                <div className="gc-empty">
                  <MessageSquare size={32} />
                  <p>Nenhum depoimento cadastrado ainda.</p>
                  <button type="button" className="gc-btn-add" onClick={addDepoimento}>
                    <Plus size={15} /> Adicionar Primeiro Depoimento
                  </button>
                </div>
              ) : (
                <div className="gc-testimonials-list">
                  {conteudo.resultados.depoimentos.map((dep, idx) => (
                    <div key={`dep-${idx}-${dep.autor}`} className="gc-testimonial-card">
                      <div className="gc-testimonial-card-header">
                        <div className="gc-testimonial-avatar">
                          {dep.autor ? dep.autor.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="gc-testimonial-meta">
                          <input
                            className="gc-input gc-input--inline"
                            type="text"
                            placeholder="Nome do cliente"
                            aria-label={`Nome do cliente do depoimento ${idx + 1}`}
                            value={dep.autor}
                            onChange={e => handleDepChange(idx, 'autor', e.target.value)}
                            required
                          />
                          <StarRating value={dep.estrelas} onChange={v => handleDepChange(idx, 'estrelas', v)} />
                        </div>
                        <button type="button" className="gc-btn-icon-danger" onClick={() => removeDepoimento(idx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        className="gc-textarea gc-textarea--depo"
                        placeholder="Texto do depoimento..."
                        aria-label={`Texto do depoimento ${idx + 1}`}
                        value={dep.texto}
                        onChange={e => handleDepChange(idx, 'texto', e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky bottom save bar */}
        <div className="gc-save-bar">
          <span className="gc-save-hint">Lembre-se de salvar após fazer as alterações</span>
          <button type="submit" className="gc-btn-save" disabled={saving}>
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GerenciarConteudo;
