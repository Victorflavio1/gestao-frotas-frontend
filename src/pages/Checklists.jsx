import React, { useState, useEffect, useMemo } from 'react';
import {
  getChecklists,
  createChecklist,
  deleteChecklist,
} from '../services/checklistService';
import { getVeiculos } from '../services/veiculoService';
import { getMotoristas } from '../services/motoristaService';
import {
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Eye,
} from 'lucide-react';

import {
  exportarChecklistsExcel,
  exportarChecklistsPDF,
} from '../utils/exportUtils';

export default function Checklists() {
  const [checklists, setChecklists] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null); // Estado para o modal de visualização
  const [busca, setBusca] = useState('');

  // 1. Dados Iniciais
  const [tipoChecklist, setTipoChecklist] = useState('ABERTURA');
  const [veiculoId, setVeiculoId] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [nivelCombustivel, setNivelCombustivel] = useState('100%');
  const [cartaoCombustivel, setCartaoCombustivel] = useState('OK');

  // 2. Documentação e Emergência
  const [documentoCrlv, setDocumentoCrlv] = useState('OK');
  const [triangulo, setTriangulo] = useState('OK');
  const [chaveRoda, setChaveRoda] = useState('OK');
  const [macaco, setMacaco] = useState('OK');
  const [extintor, setExtintor] = useState('N_A');
  const [tacografosFaixas, setTacografosFaixas] = useState('N_A');
  const [episCapacete, setEpisCapacete] = useState('N_A');

  // 3. Níveis e Mecânica
  const [nivelOleo, setNivelOleo] = useState('OK');
  const [liquidoArrefecimento, setLiquidoArrefecimento] = useState('OK');
  const [sistemaFreio, setSistemaFreio] = useState('OK');
  const [suspensaoTransmissao, setSuspensaoTransmissao] = useState('OK');
  const [hidraulicoMunck, setHidraulicoMunck] = useState('N_A');

  // 4. Pneus e Rodagem
  const [pneuDd, setPneuDd] = useState('BOM');
  const [pneuDe, setPneuDe] = useState('BOM');
  const [pneuTd, setPneuTd] = useState('BOM');
  const [pneuTe, setPneuTe] = useState('BOM');
  const [estepe, setEstepe] = useState('BOM');

  // 5. Iluminação e Visibilidade
  const [eletricaFarois, setEletricaFarois] = useState('OK');
  const [parabrisaLimpadores, setParabrisaLimpadores] = useState('OK');

  // 6. Observações
  const [observacoes, setObservacoes] = useState('');

  const carregarDados = async () => {
    try {
      const [dataCheck, dataVeic, dataMot] = await Promise.all([
        getChecklists().catch(() => []),
        getVeiculos().catch(() => []),
        getMotoristas().catch(() => []),
      ]);
      setChecklists(dataCheck || []);
      setVeiculos(dataVeic || []);
      setMotoristas(dataMot || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const veiculoSelecionado = useMemo(() => {
    return veiculos.find((v) => String(v.id) === String(veiculoId));
  }, [veiculos, veiculoId]);

  const isMoto = veiculoSelecionado?.tipo?.toUpperCase() === 'MOTO';

  const handleOpenModalNovo = () => {
    setTipoChecklist('ABERTURA');
    setVeiculoId('');
    setMotoristaId('');
    setKmAtual('');
    setNivelCombustivel('100%');
    setCartaoCombustivel('OK');

    setDocumentoCrlv('OK');
    setTriangulo('OK');
    setChaveRoda('OK');
    setMacaco('OK');
    setExtintor('N_A');
    setTacografosFaixas('N_A');
    setEpisCapacete('N_A');

    setNivelOleo('OK');
    setLiquidoArrefecimento('OK');
    setSistemaFreio('OK');
    setSuspensaoTransmissao('OK');
    setHidraulicoMunck('N_A');

    setPneuDd('BOM');
    setPneuDe('BOM');
    setPneuTd('BOM');
    setPneuTe('BOM');
    setEstepe('BOM');

    setEletricaFarois('OK');
    setParabrisaLimpadores('OK');
    setObservacoes('');

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tipo_checklist: tipoChecklist,
      veiculo_id: veiculoId,
      motorista_id: motoristaId,
      km_atual: Number(kmAtual),
      nivel_combustivel: nivelCombustivel,
      cartao_combustivel: cartaoCombustivel,

      documento_crlv: documentoCrlv,
      triangulo: isMoto ? 'N_A' : triangulo,
      chave_roda: isMoto ? 'N_A' : chaveRoda,
      macaco: isMoto ? 'N_A' : macaco,
      extintor: isMoto ? 'N_A' : extintor,
      tacografos_faixas: tacografosFaixas,
      epis_capacete: episCapacete,

      nivel_oleo: nivelOleo,
      liquido_arrefecimento: liquidoArrefecimento,
      sistema_freio: sistemaFreio,
      suspensao_transmissao: suspensaoTransmissao,
      hidraulico_munck: hidraulicoMunck,

      pneu_dd: pneuDd,
      pneu_de: isMoto ? 'N_A' : pneuDe,
      pneu_td: pneuTd,
      pneu_te: isMoto ? 'N_A' : pneuTe,
      estepe: isMoto ? 'N_A' : estepe,

      eletrica_farois: eletricaFarois,
      parabrisa_limpadores: isMoto ? 'N_A' : parabrisaLimpadores,

      observacoes,
    };

    try {
      await createChecklist(payload);
      alert('Checklist registrado com sucesso!');
      setShowModal(false);
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar checklist.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente remover este registro de checklist?')) {
      try {
        await deleteChecklist(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir checklist.');
      }
    }
  };

  const checklistsFiltrados = useMemo(() => {
    return checklists.filter((c) => {
      const termo = busca.toLowerCase();
      const placa = c.placa || c.veiculo_placa || '';
      const motorista = c.motorista_nome || c.motorista || '';
      return (
        placa.toLowerCase().includes(termo) ||
        motorista.toLowerCase().includes(termo)
      );
    });
  }, [checklists, busca]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Checklists
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary btn-export-excel"
            onClick={() => exportarChecklistsExcel(checklistsFiltrados)}
            title="Exportar Filtrados para Excel"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button
            className="btn-secondary btn-export-pdf"
            onClick={() => exportarChecklistsPDF(checklistsFiltrados)}
            title="Exportar Filtrados para PDF"
          >
            <FileText size={18} /> PDF
          </button>
          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Novo Checklist
          </button>
        </div>
      </div>

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
          placeholder="Buscar por veículo ou motorista..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data / Hora</th>
              <th>Veículo</th>
              <th>Motorista</th>
              <th>KM</th>
              <th>Combustível</th>
              <th>Status</th>
              <th>Observações</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {checklistsFiltrados.length > 0 ? (
              checklistsFiltrados.map((c) => {
                const dataFormatada = c.data_checklist
                  ? new Date(c.data_checklist).toLocaleString('pt-BR')
                  : '-';
                const temPendencia = c.status_geral === 'COM_PENDENCIA';

                return (
                  <tr key={c.id}>
                    <td data-label="Tipo">
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            c.tipo_checklist === 'ABERTURA'
                              ? '#1e3a8a'
                              : '#312e81',
                          color: '#93c5fd',
                          fontWeight: 'bold',
                        }}
                      >
                        {c.tipo_checklist || 'ABERTURA'}
                      </span>
                    </td>
                    <td data-label="Data">{dataFormatada}</td>
                    <td
                      data-label="Veículo"
                      style={{ fontWeight: 'bold', color: '#60a5fa' }}
                    >
                      {c.placa || c.veiculo_placa || c.veiculo_id}
                    </td>
                    <td data-label="Motorista">
                      {c.motorista_nome || c.motorista || '-'}
                    </td>
                    <td data-label="KM">
                      {c.km_atual
                        ? `${Number(c.km_atual).toLocaleString('pt-BR')} km`
                        : '-'}
                    </td>
                    <td data-label="Combustível">
                      {c.nivel_combustivel || '-'}
                    </td>
                    <td data-label="Status">
                      {temPendencia ? (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <AlertTriangle size={14} /> PENDÊNCIA
                        </span>
                      ) : (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle2 size={14} /> APROVADO
                        </span>
                      )}
                    </td>
                    <td data-label="Observações" style={{ maxWidth: '200px' }}>
                      {c.observacoes || '-'}
                    </td>
                    <td data-label="Ações" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedChecklist(c)}
                          className="btn-icon-primary"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn-icon-danger"
                          title="Excluir Checklist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: 'center', padding: '24px' }}
                >
                  Nenhum checklist registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE VISUALIZAÇÃO DOS ITENS */}
      {selectedChecklist && (
        <div className="modal-overlay" onClick={() => setSelectedChecklist(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <ClipboardCheck size={22} style={{ marginRight: '8px' }} />
                Detalhes do Checklist #{selectedChecklist.id}
              </h2>
              <button
                className="btn-close"
                onClick={() => setSelectedChecklist(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Informações Gerais */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '14px',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Veículo</span>
                  <strong>{selectedChecklist.placa || selectedChecklist.veiculo_placa || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Motorista</span>
                  <strong>{selectedChecklist.motorista_nome || selectedChecklist.motorista || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Tipo</span>
                  <strong>{selectedChecklist.tipo_checklist || 'ABERTURA'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>KM Atual</span>
                  <strong>{selectedChecklist.km_atual ? `${Number(selectedChecklist.km_atual).toLocaleString('pt-BR')} km` : '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Combustível</span>
                  <strong>{selectedChecklist.nivel_combustivel || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Cartão Combustível</span>
                  <strong>{selectedChecklist.cartao_combustivel || '-'}</strong>
                </div>
              </div>

              {/* Seção 1: Documentação e Emergência */}
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#60a5fa', marginTop: 0, marginBottom: '10px' }}>
                  Documentação e Emergência
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div>CRLV: <strong>{selectedChecklist.documento_crlv || '-'}</strong></div>
                  <div>Triângulo: <strong>{selectedChecklist.triangulo || '-'}</strong></div>
                  <div>Chave de Roda: <strong>{selectedChecklist.chave_roda || '-'}</strong></div>
                  <div>Macaco: <strong>{selectedChecklist.macaco || '-'}</strong></div>
                  <div>Extintor: <strong>{selectedChecklist.extintor || '-'}</strong></div>
                  <div>Tacógrafo/Faixas: <strong>{selectedChecklist.tacografos_faixas || '-'}</strong></div>
                  <div>EPIs / Capacete: <strong>{selectedChecklist.epis_capacete || '-'}</strong></div>
                </div>
              </div>

              {/* Seção 2: Níveis e Mecânica */}
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#60a5fa', marginTop: 0, marginBottom: '10px' }}>
                  Níveis e Mecânica
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div>Nível de Óleo: <strong>{selectedChecklist.nivel_oleo || '-'}</strong></div>
                  <div>Arrefecimento: <strong>{selectedChecklist.liquido_arrefecimento || '-'}</strong></div>
                  <div>Sistema Freio: <strong>{selectedChecklist.sistema_freio || '-'}</strong></div>
                  <div>Suspensão/Transm.: <strong>{selectedChecklist.suspensao_transmissao || '-'}</strong></div>
                  <div>Hidráulico/Munck: <strong>{selectedChecklist.hidraulico_munck || '-'}</strong></div>
                </div>
              </div>

              {/* Seção 3: Pneus e Rodagem */}
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#60a5fa', marginTop: 0, marginBottom: '10px' }}>
                  Pneus e Rodagem
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div>Pneu Diant. Dir. (DD): <strong>{selectedChecklist.pneu_dd || '-'}</strong></div>
                  <div>Pneu Diant. Esq. (DE): <strong>{selectedChecklist.pneu_de || '-'}</strong></div>
                  <div>Pneu Tras. Dir. (TD): <strong>{selectedChecklist.pneu_td || '-'}</strong></div>
                  <div>Pneu Tras. Esq. (TE): <strong>{selectedChecklist.pneu_te || '-'}</strong></div>
                  <div>Estepe: <strong>{selectedChecklist.estepe || '-'}</strong></div>
                </div>
              </div>

              {/* Seção 4: Iluminação e Visibilidade */}
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#60a5fa', marginTop: 0, marginBottom: '10px' }}>
                  Iluminação e Visibilidade
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div>Elétrica e Faróis: <strong>{selectedChecklist.eletrica_farois || '-'}</strong></div>
                  <div>Para-brisas e Limpadores: <strong>{selectedChecklist.parabrisa_limpadores || '-'}</strong></div>
                </div>
              </div>

              {/* Observações */}
              {selectedChecklist.observacoes && (
                <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#60a5fa', marginTop: 0, marginBottom: '6px' }}>
                    Observações / Relato de Avarias
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1' }}>
                    {selectedChecklist.observacoes}
                  </p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedChecklist(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / NOVO CHECKLIST */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <ClipboardCheck size={22} style={{ marginRight: '8px' }} />
                Novo Checklist de Inspeção
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* SEÇÃO 1: Dados Iniciais */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '14px',
                  borderRadius: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: '#60a5fa',
                    marginTop: 0,
                    marginBottom: '12px',
                  }}
                >
                  1. Dados Iniciais e Identificação
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Tipo Checklist *
                    </label>
                    <select
                      className="input-control"
                      value={tipoChecklist}
                      onChange={(e) => setTipoChecklist(e.target.value)}
                      required
                    >
                      <option value="ABERTURA">Abertura de Turno</option>
                      <option value="FECHAMENTO">Fechamento de Turno</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Veículo *
                    </label>
                    <select
                      className="input-control"
                      value={veiculoId}
                      onChange={(e) => setVeiculoId(e.target.value)}
                      required
                    >
                      <option value="">Selecione...</option>
                      {veiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa} - {v.modelo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Motorista *
                    </label>
                    <select
                      className="input-control"
                      value={motoristaId}
                      onChange={(e) => setMotoristaId(e.target.value)}
                      required
                    >
                      <option value="">Selecione...</option>
                      {motoristas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      KM / Horímetro *
                    </label>
                    <input
                      type="number"
                      className="input-control"
                      placeholder="ex: 68450"
                      value={kmAtual}
                      onChange={(e) => setKmAtual(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Combustível *
                    </label>
                    <select
                      className="input-control"
                      value={nivelCombustivel}
                      onChange={(e) => setNivelCombustivel(e.target.value)}
                    >
                      <option value="Reserva">Reserva</option>
                      <option value="25%">1/4 (25%)</option>
                      <option value="50%">1/2 (50%)</option>
                      <option value="75%">3/4 (75%)</option>
                      <option value="100%">Cheio (100%)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Cartão Combustível
                    </label>
                    <select
                      className="input-control"
                      value={cartaoCombustivel}
                      onChange={(e) => setCartaoCombustivel(e.target.value)}
                    >
                      <option value="OK">OK / Presente</option>
                      <option value="NAO_POSSUI">Não Possui</option>
                      <option value="N_A">N/A (Não se Aplica)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: Documentação e Emergência */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '14px',
                  borderRadius: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: '#60a5fa',
                    marginTop: 0,
                    marginBottom: '12px',
                  }}
                >
                  2. Documentação e Emergência
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Documento CRLV
                    </label>
                    <select
                      className="input-control"
                      value={documentoCrlv}
                      onChange={(e) => setDocumentoCrlv(e.target.value)}
                    >
                      <option value="OK">OK / Presente</option>
                      <option value="VENCIDO">Vencido</option>
                      <option value="AUSENTE">Ausente</option>
                    </select>
                  </div>

                  {!isMoto && (
                    <>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Triângulo
                        </label>
                        <select
                          className="input-control"
                          value={triangulo}
                          onChange={(e) => setTriangulo(e.target.value)}
                        >
                          <option value="OK">OK</option>
                          <option value="NAO_OK">Não OK / Quebrado</option>
                          <option value="AUSENTE">Ausente</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Chave de Roda
                        </label>
                        <select
                          className="input-control"
                          value={chaveRoda}
                          onChange={(e) => setChaveRoda(e.target.value)}
                        >
                          <option value="OK">OK</option>
                          <option value="NAO_OK">Não OK</option>
                          <option value="AUSENTE">Ausente</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Macaco
                        </label>
                        <select
                          className="input-control"
                          value={macaco}
                          onChange={(e) => setMacaco(e.target.value)}
                        >
                          <option value="OK">OK</option>
                          <option value="NAO_OK">Não OK</option>
                          <option value="AUSENTE">Ausente</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Extintor de Incêndio
                        </label>
                        <select
                          className="input-control"
                          value={extintor}
                          onChange={(e) => setExtintor(e.target.value)}
                        >
                          <option value="OK">OK</option>
                          <option value="VENCIDO">Vencido</option>
                          <option value="AUSENTE">Ausente</option>
                          <option value="N_A">N/A</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Tacógrafo / Faixas Refletivas
                    </label>
                    <select
                      className="input-control"
                      value={tacografosFaixas}
                      onChange={(e) => setTacografosFaixas(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="VENCIDO">Vencido / Danificado</option>
                      <option value="N_A">N/A (Não se Aplica)</option>
                    </select>
                  </div>

                  {isMoto && (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        EPIs / Capacete / Trava
                      </label>
                      <select
                        className="input-control"
                        value={episCapacete}
                        onChange={(e) => setEpisCapacete(e.target.value)}
                      >
                        <option value="OK">OK</option>
                        <option value="DANIFICADO">Danificado</option>
                        <option value="AUSENTE">Ausente</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* SEÇÃO 3: Níveis e Mecânica */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '14px',
                  borderRadius: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: '#60a5fa',
                    marginTop: 0,
                    marginBottom: '12px',
                  }}
                >
                  3. Níveis e Mecânica Preventiva
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Nível Óleo do Motor
                    </label>
                    <select
                      className="input-control"
                      value={nivelOleo}
                      onChange={(e) => setNivelOleo(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="BAIXO">Baixo</option>
                      <option value="VAZAMENTO">Vazamento</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Líquido de Arrefecimento
                    </label>
                    <select
                      className="input-control"
                      value={liquidoArrefecimento}
                      onChange={(e) => setLiquidoArrefecimento(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="BAIXO">Baixo</option>
                      <option value="VAZAMENTO">Vazamento</option>
                      <option value="N_A">N/A (Refrigeração a Ar)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Sistema de Freios
                    </label>
                    <select
                      className="input-control"
                      value={sistemaFreio}
                      onChange={(e) => setSistemaFreio(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="RUIDO">Com Ruído</option>
                      <option value="COM_DEFEITO">Com Defeito</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Suspensão / Transmissão
                    </label>
                    <select
                      className="input-control"
                      value={suspensaoTransmissao}
                      onChange={(e) => setSuspensaoTransmissao(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="COM_DEFEITO">Com Defeito / Folga</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Hidráulico / Munck
                    </label>
                    <select
                      className="input-control"
                      value={hidraulicoMunck}
                      onChange={(e) => setHidraulicoMunck(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="VAZAMENTO">Com Vazamento</option>
                      <option value="N_A">N/A (Não se Aplica)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: Pneus e Rodagem */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '14px',
                  borderRadius: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: '#60a5fa',
                    marginTop: 0,
                    marginBottom: '12px',
                  }}
                >
                  4. Pneus e Rodagem {isMoto && '(Modo Moto)'}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {isMoto
                        ? 'Pneu Dianteiro'
                        : 'Pneu Dianteiro Direito (DD)'}
                    </label>
                    <select
                      className="input-control"
                      value={pneuDd}
                      onChange={(e) => setPneuDd(e.target.value)}
                    >
                      <option value="BOM">Bom</option>
                      <option value="MEIA_VIDA">Meia Vida</option>
                      <option value="RUIM">Ruim / Careca</option>
                    </select>
                  </div>

                  {!isMoto && (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Pneu Dianteiro Esquerdo (DE)
                      </label>
                      <select
                        className="input-control"
                        value={pneuDe}
                        onChange={(e) => setPneuDe(e.target.value)}
                      >
                        <option value="BOM">Bom</option>
                        <option value="MEIA_VIDA">Meia Vida</option>
                        <option value="RUIM">Ruim / Careca</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {isMoto ? 'Pneu Traseiro' : 'Pneu Traseiro Direito (TD)'}
                    </label>
                    <select
                      className="input-control"
                      value={pneuTd}
                      onChange={(e) => setPneuTd(e.target.value)}
                    >
                      <option value="BOM">Bom</option>
                      <option value="MEIA_VIDA">Meia Vida</option>
                      <option value="RUIM">Ruim / Careca</option>
                    </select>
                  </div>

                  {!isMoto && (
                    <>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Pneu Traseiro Esquerdo (TE)
                        </label>
                        <select
                          className="input-control"
                          value={pneuTe}
                          onChange={(e) => setPneuTe(e.target.value)}
                        >
                          <option value="BOM">Bom</option>
                          <option value="MEIA_VIDA">Meia Vida</option>
                          <option value="RUIM">Ruim / Careca</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Estepe / Calços
                        </label>
                        <select
                          className="input-control"
                          value={estepe}
                          onChange={(e) => setEstepe(e.target.value)}
                        >
                          <option value="BOM">Bom</option>
                          <option value="MEIA_VIDA">Meia Vida</option>
                          <option value="RUIM">Ruim / Careca</option>
                          <option value="AUSENTE">Ausente</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SEÇÃO 5: Iluminação e Visibilidade */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '14px',
                  borderRadius: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: '#60a5fa',
                    marginTop: 0,
                    marginBottom: '12px',
                  }}
                >
                  5. Iluminação e Visibilidade
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Elétrica e Faróis
                    </label>
                    <select
                      className="input-control"
                      value={eletricaFarois}
                      onChange={(e) => setEletricaFarois(e.target.value)}
                    >
                      <option value="OK">OK</option>
                      <option value="LAMPADA_QUEIMADA">Lâmpada Queimada</option>
                      <option value="COM_DEFEITO">Com Defeito</option>
                    </select>
                  </div>

                  {!isMoto && (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Para-brisas e Limpadores
                      </label>
                      <select
                        className="input-control"
                        value={parabrisaLimpadores}
                        onChange={(e) => setParabrisaLimpadores(e.target.value)}
                      >
                        <option value="OK">OK</option>
                        <option value="TRINCADO">Trincado / Rachado</option>
                        <option value="DEFEITUOSO">
                          Palheta / Esguicho Defeituoso
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* SEÇÃO 6: Observações */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  6. Relato de Avarias / Observações
                </label>
                <textarea
                  className="input-control"
                  rows={3}
                  placeholder="Descreva pendências, detalhes de avarias ou observações gerais..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
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
                  Salvar Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}