import React, { useState, useEffect, useCallback } from 'react';
import api, { API_URL } from '../api';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowUpRight, CheckCircle, ChevronUp, Sparkles } from 'lucide-react';
import './Home.css';

// ─── Helpers fora do componente para reduzir complexidade cognitiva ───
function aplicarMascaraWhatsapp(valor) {
  const nums = valor.replaceAll(/\D/g, '');
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
}


// ─────────────────────────────────────────────────────────────────────

function Home() {
  const [modalAberto, setModalAberto] = useState(false);
  const [fluxo, setFluxo] = useState("FACIAL");
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [servicosBanco, setServicosBanco] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [erroForm, setErroForm] = useState('');
  const [mostrarVoltarTopo, setMostrarVoltarTopo] = useState(false);
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [carregarMapa, setCarregarMapa] = useState(false);

  const [dadosForm, setDadosForm] = useState({
    nome: '',
    whatsapp: '',
    queixa: '',
    dataNascimento: '',
  });



  const carregarServicos = useCallback(async () => {
    try {
      const resp = await api.get('/api/servicos');
      setServicosBanco(resp.data);
    } catch (err) { console.error("Erro ao carregar serviços:", err); }
  }, []);

  const carregarHomeData = useCallback(async () => {
    try {
      const resp = await api.get('/api/homepage');
      if (resp.data) {
        setHomeData(resp.data);
      }
    } catch (err) { console.error("Erro ao carregar conteúdo da home:", err); }
  }, []);

  useEffect(() => {
    carregarServicos();
    carregarHomeData();
  }, [carregarServicos, carregarHomeData]);

  useEffect(() => {
    const handleScroll = () => setMostrarVoltarTopo(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visivel');
            if (entry.target.id === 'map-container-io') {
              setCarregarMapa(true);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px 200px 0px' }
    );

    // Adding a slight delay to ensure DOM is fully painted after data load
    const timeout = setTimeout(() => {
      const elementos = document.querySelectorAll('.animar-entrada');
      elementos.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
      const elementos = document.querySelectorAll('.animar-entrada');
      elementos.forEach((el) => observer.unobserve(el));
    };
  }, [homeData, servicosBanco]);

  const voltarAoTopo = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (etapa === 1) proximaEtapa();
      else if (etapa === 2) enviarAgendamento();
    }
  };

  // aplicarMascaraWhatsapp movida para fora do componente (reduz complexidade cognitiva)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const valorFinal = name === 'whatsapp' ? aplicarMascaraWhatsapp(value) : value;
    setDadosForm(prev => ({ ...prev, [name]: valorFinal }));
  };

  const abrirModalComServico = (servico) => {
    setFluxo(servico.categoria);
    setDadosForm(prev => ({ ...prev, queixa: servico.titulo }));
    setErroForm('');
    setModalAberto(true);
    setEtapa(1); // Sempre começa pedindo o Whats
  };

  const proximaEtapa = async () => {
    setErroForm('');
    const whatsappLimpo = dadosForm.whatsapp.replaceAll(/\D/g, '');

    if (whatsappLimpo.length < 11) {
      return setErroForm("Por favor, digite um WhatsApp válido com DDD.");
    }
    if (!lgpdAceito) return setErroForm("Você precisa aceitar a Política de Privacidade para continuar.");

    setEtapa(2);
  };

  const enviarAgendamento = async () => {
    setErroForm('');
    if (!dadosForm.nome || !dadosForm.queixa) return setErroForm("Preencha seu nome e escolha o procedimento.");
    setCarregando(true);

    const dadosParaEnviar = {
      ...dadosForm,
      whatsapp: dadosForm.whatsapp.replaceAll(/\D/g, '') // Remove tudo que não é número
    };

    try {
      await api.post('/api/agendamentos', dadosParaEnviar);
      setEtapa(3); // Mostra o modal de sucesso
    } catch (error) {
      console.error("Erro ao agendar:", error);
      setErroForm("Erro ao agendar. Tente novamente.");
    } finally { setCarregando(false); }
  };

  useEffect(() => {
    document.title = "Fabi Contiero | Estética Avançada & Harmonização";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Especialista em harmonização facial, tratamentos corporais e capilares. Realce sua beleza com naturalidade na clínica Fabi Contiero.");
    }
  }, []);

  const fecharModal = () => {
    setModalAberto(false);
    setEtapa(1);
    setErroForm('');
    setDadosForm({ nome: '', whatsapp: '', queixa: '', dataNascimento: '' });
  };

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <div className="brand" onClick={voltarAoTopo} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') voltarAoTopo(); }}>
          <h2 className="brand-name">FABI CONTIERO</h2>
          <span className="brand-tagline">ESTÉTICA AVANÇADA</span>
        </div>
        <div className="nav-actions">
          <a href="https://www.instagram.com/estetica.fabicontiero/" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <span className="social-text">estetica.fabicontiero</span>
          </a>
          <button className="nav-cta" onClick={() => setModalAberto(true)}>AGENDAR CONSULTA</button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content animar-entrada">
            <span className="hero-badge">BELEZA & BEM-ESTAR</span>
            <h1 className="hero-title">Sua beleza, <br />sua jornada única.</h1>
            <p className="hero-subtitle">Excelência em Harmonização e Saúde Estética Avançada.</p>
            <div className="hero-buttons">
              <button className="btn-primary-gold" onClick={() => document.getElementById('especialidades')?.scrollIntoView({ behavior: 'smooth' })}>
                Conhecer Tratamentos
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="especialidades" className="services-section">
        <div className="services-header animar-entrada">
          <span className="services-eyebrow">NOSSOS TRATAMENTOS</span>
          <h2 className="section-title">Especialidades</h2>
          <p className="services-subtitle">Cada procedimento é personalizado para realçar sua beleza com naturalidade e precisão.</p>
        </div>

        <div className="specialty-tabs">
          {[
            { cat: 'FACIAL', label: 'Facial', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
            { cat: 'CORPORAL', label: 'Corporal', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4M12 18v4M6 12H2M22 12h-4M7.1 7.1L4.3 4.3M19.7 19.7l-2.8-2.8M7.1 16.9l-2.8 2.8M19.7 4.3l-2.8 2.8"/></svg> },
            { cat: 'CAPILAR', label: 'Capilar', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4-4 8-8 8-13a8 8 0 0 0-16 0c0 5 4 9 8 13z"/></svg> },
          ].map(({ cat, label, icon }) => (
            <button
              key={cat}
              className={`tab-btn ${fluxo === cat ? 'active' : ''}`}
              onClick={() => setFluxo(cat)}
            >
              {icon}
              <span>{label}</span>
              {fluxo === cat && <span className="tab-indicator" />}
            </button>
          ))}
        </div>

        <div className="services-count animar-entrada">
          <span>{servicosBanco.filter(s => s.categoria === fluxo).length} procedimento{servicosBanco.filter(s => s.categoria === fluxo).length !== 1 ? 's' : ''} disponível{servicosBanco.filter(s => s.categoria === fluxo).length !== 1 ? 'is' : ''}</span>
        </div>

        <div className="treatment-grid">
          {servicosBanco.filter(s => s.categoria === fluxo).map(servico => (
            <div className="treatment-card" key={servico._id}>
              <div className="card-image-container">
                {servico.imagem ? (
                  <img
                    src={servico.imagem.startsWith('http') ? servico.imagem : `${API_URL}${servico.imagem}`}
                    alt={servico.titulo}
                    className="card-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="card-icon-fallback">
                    <Sparkles size={36} color="var(--gold)" />
                    <span>Imagem em breve</span>
                  </div>
                )}
                <div className="card-category-badge">{servico.categoria}</div>
              </div>
              <div className="card-content">
                <h4>{servico.titulo}</h4>
                <p>{servico.descricao}</p>
                <button className="btn-card" onClick={() => abrirModalComServico(servico)}>
                  Agendar Consulta
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          ))}
          {servicosBanco.filter(s => s.categoria === fluxo).length === 0 && (
            <div className="services-empty">
              <Sparkles size={40} color="var(--gold-light)" />
              <p>Nenhum procedimento cadastrado nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      <section className="essence-section">
        <div className="essence-container">
          <div className="essence-image-side animar-entrada">
            <div className="essence-image-frame">
              {homeData?.essencia?.imagemEssencia ? (
                <img
                  src={homeData.essencia.imagemEssencia}
                  alt="Nossa Essência"
                  className="essence-photo"
                />
              ) : (
                <div className="essence-placeholder-img">
                  <Sparkles size={48} color="var(--gold)" />
                </div>
              )}
            </div>
          </div>
          <div className="essence-text-side animar-entrada">
            <h3 className="essence-title">{homeData?.essencia?.titulo || "NOSSA ESSÊNCIA"}</h3>
            <p className="essence-description">
              {homeData?.essencia?.descricao || "Acreditamos que a verdadeira beleza reside na harmonia. Nossa missão é proporcionar resultados que respeitem sua identidade, utilizando técnicas avançadas e um olhar artístico para reconectar você com sua melhor versão."}
            </p>
            <div className="essence-values">
              {homeData?.essencia?.topicos?.length > 0 ? (
                homeData.essencia.topicos.map((topico, i) => (
                  <div className="value-item" key={topico.titulo || `topico-${i}`}>
                    <strong>{topico.titulo}</strong>
                    <p>{topico.descricao}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="value-item">
                    <strong>Segurança</strong>
                    <p>Protocolos rigorosos e técnica impecável.</p>
                  </div>
                  <div className="value-item">
                    <strong>Naturalidade</strong>
                    <p>O segredo de um bom procedimento é ser imperceptível.</p>
                  </div>
                  <div className="value-item">
                    <strong>Autoestima</strong>
                    <p>Mais do que estética, uma jornada de confiança.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header animar-entrada">
          <h3 className="section-title">{homeData?.resultados?.titulo || "RESULTADOS REAIS"}</h3>
        </div>

        <div className="testimonials-grid animar-entrada">
          {(homeData?.resultados?.depoimentos?.length > 0
            ? homeData.resultados.depoimentos
            : [
              { autor: "Ana Paula S.", texto: "A Fabi é uma profissional impecável. Fiz bioestimuladores e o resultado ficou super natural, exatamente como eu queria!", estrelas: 5 },
              { autor: "Mariana L.", texto: "Melhor experiência estética que já tive. O atendimento é personalizado e o ambiente passa muita segurança.", estrelas: 5 },
              { autor: "Carla Ferreira", texto: "Resultados incríveis na harmonização facial. Recomendo de olhos fechados!", estrelas: 5 }
            ]
          ).map((t, i) => (
            <div className="testimonial-card" key={t.autor || t.nome || `depoimento-${i}`}>
              <div className="stars">
                {Array.from({ length: t.estrelas || t.nota || 5 }).map((_, idx) => (
                  <Star key={`star-${idx}`} fill="var(--gold)" color="var(--gold)" size={16} />
                ))}
              </div>
              <p className="testimonial-text">"{t.texto}"</p>
              <h5 className="testimonial-author">{t.autor || t.nome}</h5>
            </div>
          ))}
        </div>
      </section>

      <section id="localizacao" className="location-section">
        <div className="location-container">
          <div className="location-info">
            <div className="info-card animar-entrada">
              <h3>ONDE ESTAMOS</h3>
              <p>Av Pereira Barreto, 1395 - Sala 173</p>
              <p>Bairro Paraíso, Santo André - SP</p>
              <p>CEP: 09190-610</p>
              <a
                href="https://www.google.com/maps/dir//Av.+Pereira+Barreto,+1395+-+Paraíso,+Santo+André+-+SP,+09190-610"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-route"
              >
                Como Chegar <ArrowUpRight size={16} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </a>
            </div>
            <div className="info-card animar-entrada">
              <h3>HORÁRIOS</h3>
              <p>Segunda a Sexta: 09h às 19h</p>
              <p>Sábado: 09h às 13h</p>
            </div>
          </div>
          <div className="location-map animar-entrada" id="map-container-io">
            {carregarMapa ? (
              <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
                <Map
                  defaultCenter={{ lat: -23.6793169, lng: -46.5380998 }}
                  defaultZoom={16}
                  mapId="DEMO_MAP_ID"
                  style={{ width: '100%', height: '100%', borderRadius: '20px' }}
                  disableDefaultUI={false}
                >
                  <AdvancedMarker position={{ lat: -23.6793169, lng: -46.5380998 }} />
                </Map>
              </APIProvider>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdf7f2', borderRadius: '20px', color: '#c5a089' }}>
                Carregando mapa...
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cta-premium-section">
        <div className="cta-premium-content animar-entrada">
          <h2>Transforme sua autoestima.</h2>
          <p>Agende uma consulta e descubra o melhor caminho para realçar sua beleza natural.</p>
          <button className="btn-primary-gold" onClick={() => setModalAberto(true)}>
            Agendar Agora
          </button>
        </div>
      </section>

      <footer className="footer-premium">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>FABI CONTIERO</h2>
            <p>ESTÉTICA AVANÇADA</p>
          </div>

          <div className="footer-location">
            <h4>SANTO ANDRÉ</h4>
            <p>Av Pereira Barreto, 1395 - Sala 173</p>
            <p>Bairro Paraíso, Santo André - SP</p>
          </div>

          <div className="footer-links">
            <div className="footer-socials">
              <a href="https://www.instagram.com/estetica.fabicontiero/" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span className="social-text">estetica.fabicontiero</span>
              </a>
            </div>
            <p>© 2026 Fabi Contiero. Todos os direitos reservados.</p>
            <a href="/login" className="admin-subtle-link">Área Administrativa</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {modalAberto && (
          <motion.div className="modal-overlay" onClick={fecharModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card" onClick={e => e.stopPropagation()} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              <button className="close-modal" onClick={fecharModal}>&times;</button>

              {etapa === 3 ? (
                <div className="modal-success-state">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                    <CheckCircle size={64} color="var(--gold)" />
                  </motion.div>
                  <h2>Agendamento Confirmado!</h2>
                  <p>Obrigada, {dadosForm.nome.split(' ')[0]}! Nossa equipe entrará em contato em breve pelo WhatsApp.</p>
                  <button className="btn-confirm" onClick={fecharModal}>FECHAR</button>
                </div>
              ) : (
                <>
                  <div className="modal-header">
                    <h2>{etapa === 1 ? "Bem-vinda" : "Seus Dados"}</h2>
                    <p>{etapa === 1 ? "Informe seu contato para continuarmos." : "Confirme as informações abaixo para o seu agendamento."}</p>
                  </div>

                  <div className="modal-body" onKeyDown={handleKeyDown} role="presentation">
                    {erroForm && <p className="form-error-toast">{erroForm}</p>}

                    {etapa === 1 ? (
                      <div className="form-container">
                        <label className="label-claro" htmlFor="whatsappInput">WhatsApp / Telefone</label>
                        <input type="text" id="whatsappInput" name="whatsapp" className="premium-input" value={dadosForm.whatsapp} onChange={handleInputChange} placeholder="(00) 00000-0000" autoFocus />
                        <button className="btn-confirm" onClick={proximaEtapa} disabled={carregando}>
                          {carregando ? <div className="loader-mini"></div> : "CONTINUAR"}
                        </button>

                        <label className="lgpd-label" htmlFor="lgpdCheckbox">
                          <input
                            type="checkbox"
                            id="lgpdCheckbox"
                            checked={lgpdAceito}
                            onChange={(e) => setLgpdAceito(e.target.checked)}
                          />
                          <span>
                            Li e aceito a{' '}
                            <a href="/politica-de-privacidade.html" target="_blank" rel="noopener noreferrer">
                              Política de Privacidade
                            </a>
                            {' '}e consinto com o uso dos meus dados para fins de agendamento (LGPD).
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="form-container">
                        <div className="input-group">
                          <label className="label-claro" htmlFor="nomeInput">Nome Completo</label>
                          <input
                            type="text"
                            id="nomeInput"
                            name="nome"
                            className="premium-input"
                            value={dadosForm.nome}
                            onChange={handleInputChange}
                            placeholder="Como devemos te chamar?"
                          />
                        </div>

                        <div className="input-group">
                          <label className="label-claro" htmlFor="dataNascimentoInput">Data de Nascimento</label>
                          <input
                            type="date"
                            id="dataNascimentoInput"
                            name="dataNascimento"
                            className="premium-input"
                            value={dadosForm.dataNascimento}
                            onChange={handleInputChange}
                          />
                        </div>

                        <label className="label-claro" id="area-label">Área de Interesse</label>
                        <div className="pill-group" role="group" aria-labelledby="area-label">
                          {['FACIAL', 'CORPORAL', 'CAPILAR'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              className={`pill-btn ${fluxo === cat ? 'active' : ''}`}
                              onClick={() => setFluxo(cat)}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        <label className="label-claro" id="procedimento-label">Procedimento</label>
                        <div className="pill-group procedure-pills" role="group" aria-labelledby="procedimento-label">
                          {servicosBanco.filter(s => s.categoria === fluxo).map(s => (
                            <button
                              key={s._id}
                              type="button"
                              className={`pill-btn procedure-pill ${dadosForm.queixa === s.titulo ? 'active' : ''}`}
                              onClick={() => handleInputChange({ target: { name: 'queixa', value: s.titulo } })}
                            >
                              {s.titulo}
                            </button>
                          ))}
                        </div>

                        <button className="btn-confirm" onClick={enviarAgendamento} disabled={carregando}>
                          {carregando ? <div className="loader-mini"></div> : "FINALIZAR AGENDAMENTO"}
                        </button>
                        <button className="btn-back" onClick={() => setEtapa(1)}>Voltar</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarVoltarTopo && (
          <motion.button
            className="btn-back-to-top"
            onClick={voltarAoTopo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            title="Voltar ao topo"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
