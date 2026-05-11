import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import Cropper from 'react-easy-crop';
import { Sparkles, Scissors, Syringe, Edit2, Trash2, Check, X, Upload, Plus, Clock, DollarSign, AlertTriangle } from 'lucide-react';

const getCroppedImg = (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, 400, 400);
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas vazio'));
                resolve(blob);
            }, 'image/jpeg', 0.8);
        };
        image.onerror = () => reject(new Error('Erro ao carregar imagem'));
    });
};

const CATEGORIA_ICON = {
    FACIAL: <Sparkles size={22} color="#d4a373" />,
    CORPORAL: <Scissors size={22} color="#d4a373" />,
    CAPILAR: <Syringe size={22} color="#d4a373" />,
};

function GerenciarServicos() {
    const [servicos, setServicos] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const [panelOpen, setPanelOpen] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // {id, titulo}
    const [feedback, setFeedback] = useState(null); // {tipo: 'ok'|'erro', msg}

    // Crop states
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [photoBlob, setPhotoBlob] = useState(null);

    const [form, setForm] = useState({
        titulo: '', descricao: '', categoria: 'FACIAL', preco: '', duracao: ''
    });

    const showFeedback = (tipo, msg) => {
        setFeedback({ tipo, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const buscarServicos = async () => {
        try {
            const res = await api.get('/api/servicos');
            setServicos(res.data);
        } catch (err) {
            console.error('Erro ao buscar serviços:', err);
        }
    };

    useEffect(() => { buscarServicos(); }, []);

    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = () => setImage(reader.result);
        }
    };

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const finalizarCrop = async () => {
        try {
            const blob = await getCroppedImg(image, croppedAreaPixels);
            setPhotoBlob(blob);
            setImagePreview(URL.createObjectURL(blob));
            setImage(null);
        } catch (e) { console.error(e); }
    };

    const abrirNovo = () => {
        setEditandoId(null);
        setImagePreview(null);
        setPhotoBlob(null);
        setForm({ titulo: '', descricao: '', categoria: 'FACIAL', preco: '', duracao: '' });
        setPanelOpen(true);
    };

    const prepararEdicao = (s) => {
        setEditandoId(s._id);
        setImagePreview(s.imagem || null);
        setPhotoBlob(null);
        setForm({
            titulo: s.titulo || '',
            descricao: s.descricao || '',
            categoria: s.categoria || 'FACIAL',
            preco: s.preco || '',
            duracao: s.duracao || ''
        });
        setPanelOpen(true);
    };

    const fecharPanel = () => {
        setPanelOpen(false);
        setEditandoId(null);
        setImagePreview(null);
        setPhotoBlob(null);
        setImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (editandoId) formData.append('id', editandoId);
        if (photoBlob) formData.append('imagem', photoBlob, 'servico.jpg');
        try {
            await api.post('/api/servicos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showFeedback('ok', editandoId ? 'Serviço atualizado com sucesso!' : 'Serviço publicado com sucesso!');
            fecharPanel();
            buscarServicos();
        } catch (err) {
            console.error('Erro ao salvar serviço:', err);
            showFeedback('erro', 'Erro ao salvar o serviço. Tente novamente.');
        }
    };

    const confirmarExclusao = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/api/servicos/${confirmDelete.id}`);
            showFeedback('ok', `"${confirmDelete.titulo}" removido.`);
            buscarServicos();
        } catch (err) {
            console.error('Erro ao excluir serviço:', err);
            showFeedback('erro', 'Erro ao excluir o serviço.');
        } finally {
            setConfirmDelete(null);
        }
    };

    const servicosFiltrados = servicos.filter(s => filtroCategoria === 'Todos' || s.categoria === filtroCategoria);

    return (
        <div className="sm-root">

            {/* ── Feedback toast ── */}
            {feedback && (
                <div className={`sm-toast ${feedback.tipo === 'ok' ? 'sm-toast-ok' : 'sm-toast-err'}`}>
                    {feedback.tipo === 'ok' ? <Check size={16} /> : <X size={16} />}
                    {feedback.msg}
                </div>
            )}

            {/* ── Header da lista ── */}
            <div className="sm-list-header">
                <div>
                    <h2 className="sm-title">Serviços</h2>
                    <p className="sm-subtitle">{servicos.length} procedimentos cadastrados</p>
                </div>
                <button className="sm-btn-new" onClick={abrirNovo}>
                    <Plus size={18} />
                    Novo Procedimento
                </button>
            </div>

            {/* ── Filtros ── */}
            <div className="sm-filters">
                {['Todos', 'FACIAL', 'CORPORAL', 'CAPILAR'].map(cat => (
                    <button
                        key={cat}
                        className={`sm-pill ${filtroCategoria === cat ? 'active' : ''}`}
                        onClick={() => setFiltroCategoria(cat)}
                    >
                        {cat === 'Todos' ? 'Todos' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* ── Tabela de serviços ── */}
            <div className="sm-table">
                {servicosFiltrados.length === 0 ? (
                    <div className="sm-empty">
                        <Sparkles size={36} color="#d4a373" />
                        <p>Nenhum serviço encontrado nessa categoria.</p>
                        <button className="sm-btn-new sm-btn-new-sm" onClick={abrirNovo}>
                            <Plus size={16} /> Adicionar primeiro serviço
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="sm-table-head" role="row">
                            <span role="columnheader">Serviço</span>
                            <span role="columnheader">Categoria</span>
                            <span role="columnheader">Preço</span>
                            <span role="columnheader">Duração</span>
                            <span></span>
                        </div>
                        {servicosFiltrados.map(s => (
                            <div key={s._id} className="sm-row">
                                <div className="sm-row-service">
                                    <div className="sm-thumb">
                                        {s.imagem
                                            ? <img src={s.imagem} alt="" />
                                            : <div className="sm-icon">{CATEGORIA_ICON[s.categoria] || <Sparkles size={22} color="#d4a373" />}</div>
                                        }
                                    </div>
                                    <div className="sm-row-info">
                                        <strong>{s.titulo}</strong>
                                        {s.descricao && <span>{s.descricao.slice(0, 60)}{s.descricao.length > 60 ? '…' : ''}</span>}
                                    </div>
                                </div>
                                <div className="sm-badge">{s.categoria}</div>
                                <div className="sm-meta">
                                    {s.preco ? <><DollarSign size={13} />R$ {Number(s.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</> : <span className="sm-empty-val">—</span>}
                                </div>
                                <div className="sm-meta">
                                    {s.duracao ? <><Clock size={13} />{s.duracao}</> : <span className="sm-empty-val">—</span>}
                                </div>
                                <div className="sm-row-actions">
                                    <button className="sm-act-btn" onClick={() => prepararEdicao(s)} title="Editar">
                                        <Edit2 size={15} />
                                    </button>
                                    <button className="sm-act-btn sm-act-del" onClick={() => setConfirmDelete({ id: s._id, titulo: s.titulo })} title="Excluir">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* ── Painel lateral (form) ── */}
            {panelOpen && <div className="sm-overlay" onClick={fecharPanel} />}
            <div className={`sm-panel ${panelOpen ? 'open' : ''}`}>
                <div className="sm-panel-header">
                    <h3>{editandoId ? 'Editar Procedimento' : 'Novo Procedimento'}</h3>
                    <button className="sm-panel-close" onClick={fecharPanel}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="sm-form">
                    {/* Upload de foto */}
                    <div className="sm-upload-area" onClick={() => document.getElementById('smFileInput').click()}>
                        {imagePreview
                            ? <img src={imagePreview} alt="Preview" className="sm-preview-img" />
                            : (
                                <div className="sm-upload-placeholder">
                                    <Upload size={28} color="#d4a373" />
                                    <span>Clique para adicionar foto</span>
                                    <small>JPG, PNG ou WebP</small>
                                </div>
                            )
                        }
                        <input id="smFileInput" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} hidden />
                    </div>

                    <div className="sm-form-grid">
                        <div className="sm-field sm-field-full">
                            <label htmlFor="titulo">Título *</label>
                            <input id="titulo" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Hidra Gloss" required />
                        </div>
                        <div className="sm-field">
                            <label htmlFor="categoria">Categoria *</label>
                            <select id="categoria" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                                <option value="FACIAL">Facial</option>
                                <option value="CORPORAL">Corporal</option>
                                <option value="CAPILAR">Capilar</option>
                            </select>
                        </div>
                        <div className="sm-field sm-field-full">
                            <label htmlFor="descricao">Descrição</label>
                            <textarea
                                id="descricao"
                                value={form.descricao}
                                onChange={e => setForm({ ...form, descricao: e.target.value })}
                                placeholder="Breve descrição do procedimento..."
                                rows={3}
                            />
                        </div>
                        <div className="sm-field">
                            <label htmlFor="preco">Preço (R$)</label>
                            <input id="preco" type="number" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} placeholder="0,00" />
                        </div>
                        <div className="sm-field">
                            <label htmlFor="duracao">Duração</label>
                            <input id="duracao" value={form.duracao} onChange={e => setForm({ ...form, duracao: e.target.value })} placeholder="Ex: 1h30" />
                        </div>
                    </div>

                    <div className="sm-form-actions">
                        <button type="button" className="sm-btn-cancel" onClick={fecharPanel}>Cancelar</button>
                        <button type="submit" className="sm-btn-submit">
                            {editandoId ? <><Check size={16} /> Atualizar</> : <><Sparkles size={16} /> Publicar</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Modal crop ── */}
            {image && (
                <div className="crop-overlay">
                    <div className="crop-window">
                        <div className="crop-box">
                            <Cropper image={image} crop={crop} zoom={zoom} aspect={1}
                                onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                        </div>
                        <div className="crop-footer">
                            <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(e.target.value)} />
                            <button onClick={() => setImage(null)} className="btn-c"><X size={18} style={{ marginRight: '6px' }} /> Cancelar</button>
                            <button onClick={finalizarCrop} className="btn-f"><Check size={18} style={{ marginRight: '6px' }} /> Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal de confirmação de exclusão ── */}
            {confirmDelete && (
                <div className="sm-confirm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="sm-confirm-box" onClick={e => e.stopPropagation()}>
                        <div className="sm-confirm-icon"><AlertTriangle size={32} color="#c0392b" /></div>
                        <h4>Excluir serviço?</h4>
                        <p>O serviço <strong>"{confirmDelete.titulo}"</strong> será removido permanentemente.</p>
                        <div className="sm-confirm-actions">
                            <button className="sm-btn-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                            <button className="sm-btn-danger" onClick={confirmarExclusao}>
                                <Trash2 size={15} /> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GerenciarServicos;