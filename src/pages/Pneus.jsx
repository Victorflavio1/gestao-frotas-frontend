import React, { useState, useEffect, useMemo } from 'react';
import {
  getPneus,
  createPneu,
  updatePneu,
  deletePneu,
} from '../services/pneuService';
import { getVeiculos } from '../services/veiculoService';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Disc,
  X,
  Eye,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { exportarPneusPDF, exportarPneusExcel } from '../utils/exportUtils';

export default function Pneus() {
  const [pneus, setPneus] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPneu, setSelectedPneu] = useState(null);

  // Campos do Formulário
  const [numeroFogo, setNumeroFogo] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [medida, setMedida] = useState('');
  const [tipoVida, setTipoVida] = useState('NOVO');
  const [status, setStatus] = useState('ESTOQUE');
  const [veiculoId, setVeiculoId] = useState('');
  const [posicao, setPosicao] = useState('');
  const [sulcoInicial, setSulcoInicial] = useState('16.0');
  const [sulcoAtual, setSulcoAtual] = useState('16.0');
  const [dataAquisicao, setDataAquisicao] = useState('');
  const [custoAquisicao, setCustoAquisicao] = useState('');

  const carregarDados = async () => {
    try {
      const [dataPneus, dataVeic] = await Promise.all([
        getPneus().catch(() => []),
        getVeiculos().catch(() => []),
      ]);
      setPneus(dataPneus || []);
      setVeiculos(dataVeic || []);
    } catch (err) {
      console.error('Erro ao carregar pneus:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleOpenModalNovo = () => {
    setEditingId(null);
    setNumeroFogo('');
    setMarca('');
    setModelo('');
    setMedida('');
    setTipoVida('NOVO');
    setStatus('ESTOQUE');
    setVeiculoId('');
    setPosicao('');
    setSulcoInicial('16.0');
    setSulcoAtual('16.0');
    setDataAquisicao(new Date().toISOString().split('T')[0]);
    setCustoAquisicao('');
    setShowModal(true);
  };

  const handleOpenModalEditar = (p) => {
    setEditingId(p.id);
    setNumeroFogo(p.numero_fogo || '');
    setMarca(p.marca || '');
    setModelo(p.modelo || '');
    setMedida(p.medida || '');
    setTipoVida(p.tipo_vida || 'NOVO');
    setStatus(p.status || 'ESTOQUE');
    setVeiculoId(p.veiculo_id || '');
    setPosicao(p.posicao || '');
    setSulcoInicial(p.sulco_inicial || '16.0');
    setSulcoAtual(p.sulco_atual || '16.0');
    setDataAquisicao(p.data_aquisicao ? p.data_aquisicao.split('T')[0] : '');
    setCustoAquisicao(p.custo_aquisicao || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      numero_fogo: numeroFogo,
      marca,
      modelo,
      medida,
      tipo_vida: tipoVida,
      status,
      veiculo_id:
        status === 'EM_USO' ? (veiculoId ? Number(veiculoId) : null) : null,
      posicao: status === 'EM_USO' ? posicao : null,
      sulco_inicial: Number(sulcoInicial) || 16.0,
      sulco_atual: Number(sulcoAtual) || 16.0,
      data_aquisicao: dataAquisicao || null,
      custo_aquisicao: Number(custoAquisicao) || 0.0,
    };

    try {
      if (editingId) {
        await updatePneu(editingId, payload);
        alert('Pneu atualizado com sucesso!');
      } else {
        await createPneu(payload);
        alert('Pneu cadastrado com sucesso!');
      }
      setShowModal(false);
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar pneu.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este pneu?')) {
      try {
        await deletePneu(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir pneu.');
      }
    }
  };

  const pneusFiltrados = useMemo(() => {
    return pneus.filter((p) => {
      const termo = busca.toLowerCase();
      const fogo = p.numero_fogo || '';
      const marcaMod = `${p.marca} ${p.modelo}`.toLowerCase();
      const placa = p.veiculo_placa || '';
      return (
        fogo.toLowerCase().includes(termo) ||
        marcaMod.includes(termo) ||
        placa.toLowerCase().includes(termo)
      );
    });
  }, [pneus, busca]);

  // Função utilitária para renderizar o alerta do sulco
  const getSulcoBadge = (sulco) => {
    const val = Number(sulco || 0);
    if (val <= 3.0) {
      return (
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
          {val} mm (Crítico)
        </span>
      );
    }
    if (val <= 5.0) {
      return (
        <span style={{ color: '#eab308', fontWeight: 'bold' }}>
          {val} mm (Atenção)
        </span>
      );
    }
    return (
      <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{val} mm</span>
    );
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Controle e Gestão de Pneus
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary btn-export-excel"
            onClick={() => exportarPneusExcel(pneusFiltrados)}
            title="Exportar para Excel"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>

          <button
            className="btn-secondary btn-export-pdf"
            onClick={() => exportarPneusPDF(pneusFiltrados)}
            title="Exportar para PDF"
          >
            <FileText size={18} /> PDF
          </button>

          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Novo Pneu
          </button>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <div
        style={{
          marginBottom: '16px',
          position: 'relative',
          maxWidth: '360px',
        }}
      >
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
          }}
        />
        <input
          className="input-control"
          style={{ paddingLeft: '38px' }}
          placeholder="Buscar por Nº Fogo, Marca, Modelo ou Placa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nº Fogo</th>
              <th>Marca / Modelo</th>
              <th>Medida</th>
              <th>Tipo Vida</th>
              <th>Status</th>
              <th>Veículo / Posição</th>
              <th>Sulco Atual</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pneusFiltrados.length > 0 ? (
              pneusFiltrados.map((p) => (
                <tr key={p.id}>
                  <td
                    data-label="Nº Fogo"
                    style={{ fontWeight: 'bold', color: '#38bdf8' }}
                  >
                    {p.numero_fogo}
                  </td>
                  <td data-label="Marca/Modelo">
                    {p.marca} {p.modelo}
                  </td>
                  <td data-label="Medida">{p.medida}</td>
                  <td data-label="Tipo Vida">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        color: '#cbd5e1',
                      }}
                    >
                      {p.tipo_vida}
                    </span>
                  </td>
                  <td data-label="Status">
                    {p.status === 'ESTOQUE' && (
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                        }}
                      >
                        ESTOQUE
                      </span>
                    )}
                    {p.status === 'EM_USO' && (
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          color: '#22c55e',
                        }}
                      >
                        EM USO
                      </span>
                    )}
                    {p.status === 'REPARO' && (
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: 'rgba(234, 179, 8, 0.2)',
                          color: '#eab308',
                        }}
                      >
                        REPARO
                      </span>
                    )}
                    {p.status === 'DESCARTADO' && (
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                        }}
                      >
                        DESCARTADO
                      </span>
                    )}
                  </td>
                  <td data-label="Veículo/Posição">
                    {p.status === 'EM_USO' && p.veiculo_placa ? (
                      <span>
                        <strong style={{ color: '#60a5fa' }}>
                          {p.veiculo_placa}
                        </strong>{' '}
                        {p.posicao ? `(${p.posicao})` : ''}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td data-label="Sulco">{getSulcoBadge(p.sulco_atual)}</td>
                  <td data-label="Ações" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setSelectedPneu(p);
                          setShowDetalhesModal(true);
                        }}
                        className="btn-icon-primary"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModalEditar(p)}
                        className="btn-icon-secondary"
                        title="Editar Pneu"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-icon-danger"
                        title="Excluir Pneu"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: 'center', padding: '24px' }}
                >
                  Nenhum pneu registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Disc size={22} style={{ marginRight: '8px' }} />
                {editingId ? 'Editar Pneu' : 'Novo Pneu'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Nº de Fogo *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: PN-001"
                    value={numeroFogo}
                    onChange={(e) => setNumeroFogo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Status *
                  </label>
                  <select
                    className="input-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="ESTOQUE">Estoque</option>
                    <option value="EM_USO">Em Uso (Instalado)</option>
                    <option value="REPARO">Em Reparo / Recapagem</option>
                    <option value="DESCARTADO">Descartado</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Marca *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: Michelin, Bridgestone"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Modelo *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: X Multi Z"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Medida *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: 295/80 R22.5"
                    value={medida}
                    onChange={(e) => setMedida(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Tipo de Vida
                  </label>
                  <select
                    className="input-control"
                    value={tipoVida}
                    onChange={(e) => setTipoVida(e.target.value)}
                  >
                    <option value="NOVO">Novo</option>
                    <option value="RECAPADO_1">1ª Recapagem</option>
                    <option value="RECAPADO_2">2ª Recapagem</option>
                    <option value="RECAPADO_3">3ª Recapagem</option>
                  </select>
                </div>

                {status === 'EM_USO' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Veículo Instalado *
                      </label>
                      <select
                        className="input-control"
                        value={veiculoId}
                        onChange={(e) => setVeiculoId(e.target.value)}
                        required={status === 'EM_USO'}
                      >
                        <option value="">Selecione o veículo...</option>
                        {veiculos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.placa} - {v.modelo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Posição da Rodagem
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Ex: Dianteiro Direito, Eixo 1"
                        value={posicao}
                        onChange={(e) => setPosicao(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Sulco Inicial (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-control"
                    value={sulcoInicial}
                    onChange={(e) => setSulcoInicial(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Sulco Atual (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-control"
                    value={sulcoAtual}
                    onChange={(e) => setSulcoAtual(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Data de Aquisição
                  </label>
                  <input
                    type="date"
                    className="input-control"
                    value={dataAquisicao}
                    onChange={(e) => setDataAquisicao(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Custo de Aquisição (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="0.00"
                    value={custoAquisicao}
                    onChange={(e) => setCustoAquisicao(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Pneu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {selectedPneu && showDetalhesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetalhesModal(false)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Ficha do Pneu Nº {selectedPneu.numero_fogo}</h2>
              <button
                className="btn-close"
                onClick={() => setShowDetalhesModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '0.9rem',
              }}
            >
              <div>
                <strong>Marca / Modelo:</strong> {selectedPneu.marca} -{' '}
                {selectedPneu.modelo}
              </div>
              <div>
                <strong>Medida:</strong> {selectedPneu.medida}
              </div>
              <div>
                <strong>Tipo de Vida:</strong> {selectedPneu.tipo_vida}
              </div>
              <div>
                <strong>Status:</strong> {selectedPneu.status}
              </div>
              <div>
                <strong>Veículo Atual:</strong>{' '}
                {selectedPneu.veiculo_placa
                  ? `${selectedPneu.veiculo_placa} (${selectedPneu.posicao || 'Sem posição'})`
                  : 'Nenhum / Em estoque'}
              </div>
              <div>
                <strong>Sulco Inicial:</strong> {selectedPneu.sulco_inicial} mm
              </div>
              <div>
                <strong>Sulco Atual:</strong>{' '}
                {getSulcoBadge(selectedPneu.sulco_atual)}
              </div>
              <div>
                <strong>Data de Aquisição:</strong>{' '}
                {selectedPneu.data_aquisicao
                  ? new Date(selectedPneu.data_aquisicao).toLocaleDateString(
                      'pt-BR',
                    )
                  : '-'}
              </div>
              <div>
                <strong>Custo:</strong>{' '}
                {Number(selectedPneu.custo_aquisicao || 0).toLocaleString(
                  'pt-BR',
                  { style: 'currency', currency: 'BRL' },
                )}
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowDetalhesModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
