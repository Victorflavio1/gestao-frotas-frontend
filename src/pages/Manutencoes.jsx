import React, { useState, useEffect, useMemo } from 'react';
import {
  getManutencoes,
  createManutencao,
  updateManutencao,
  deleteManutencao,
} from '../services/manutencaoService';
import { getVeiculos } from '../services/veiculoService';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Eye,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  exportarManutencoesPDF,
  exportarManutencoesExcel,
} from '../utils/exportUtils';

export default function Manutencoes() {
  const [manutencoes, setManutencoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedManutencao, setSelectedManutencao] = useState(null);

  // Campos do Formulário
  const [veiculoId, setVeiculoId] = useState('');
  const [tipoManutencao, setTipoManutencao] = useState('PREVENTIVA');
  const [status, setStatus] = useState('CONCLUIDA');
  const [dataManutencao, setDataManutencao] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [oficina, setOficina] = useState('');
  const [valorMaoObra, setValorMaoObra] = useState('');
  const [valorPecas, setValorPecas] = useState('');
  const [descricaoServico, setDescricaoServico] = useState('');
  const [proximaKm, setProximaKm] = useState('');
  const [proximaData, setProximaData] = useState('');

  const carregarDados = async () => {
    try {
      const [dataManut, dataVeic] = await Promise.all([
        getManutencoes().catch(() => []),
        getVeiculos().catch(() => []),
      ]);
      setManutencoes(dataManut || []);
      setVeiculos(dataVeic || []);
    } catch (err) {
      console.error('Erro ao carregar dados de manutenções:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Cálculo automático do custo total no form
  const custoTotalCalculado = useMemo(() => {
    const maoObra = Number(valorMaoObra) || 0;
    const pecas = Number(valorPecas) || 0;
    return maoObra + pecas;
  }, [valorMaoObra, valorPecas]);

  const handleOpenModalNovo = () => {
    setEditingId(null);
    setVeiculoId('');
    setTipoManutencao('PREVENTIVA');
    setStatus('CONCLUIDA');
    setDataManutencao(new Date().toISOString().split('T')[0]);
    setKmAtual('');
    setOficina('');
    setValorMaoObra('');
    setValorPecas('');
    setDescricaoServico('');
    setProximaKm('');
    setProximaData('');
    setShowModal(true);
  };

  const handleOpenModalEditar = (m) => {
    setEditingId(m.id);
    setVeiculoId(m.veiculo_id);
    setTipoManutencao(m.tipo_manutencao);
    setStatus(m.status);
    setDataManutencao(m.data_manutencao ? m.data_manutencao.split('T')[0] : '');
    setKmAtual(m.km_atual);
    setOficina(m.oficina || '');
    setValorMaoObra(m.valor_mao_obra || '');
    setValorPecas(m.valor_pecas || '');
    setDescricaoServico(m.descricao_servico || '');
    setProximaKm(m.proxima_km || '');
    setProximaData(m.proxima_data ? m.proxima_data.split('T')[0] : '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      veiculo_id: veiculoId,
      tipo_manutencao: tipoManutencao,
      status,
      data_manutencao: dataManutencao,
      km_atual: Number(kmAtual),
      oficina,
      valor_mao_obra: Number(valorMaoObra) || 0,
      valor_pecas: Number(valorPecas) || 0,
      descricao_servico: descricaoServico,
      proxima_km: proximaKm ? Number(proximaKm) : null,
      proxima_data: proximaData || null,
    };

    try {
      if (editingId) {
        await updateManutencao(editingId, payload);
        alert('Manutenção atualizada com sucesso!');
      } else {
        await createManutencao(payload);
        alert('Manutenção cadastrada com sucesso!');
      }
      setShowModal(false);
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar manutenção.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este registro de manutenção?')) {
      try {
        await deleteManutencao(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir manutenção.');
      }
    }
  };

  const manutencoesFiltradas = useMemo(() => {
    return manutencoes.filter((m) => {
      const termo = busca.toLowerCase();
      const placa = m.veiculo_placa || '';
      const modelo = m.veiculo_modelo || '';
      const oficinaNome = m.oficina || '';
      return (
        placa.toLowerCase().includes(termo) ||
        modelo.toLowerCase().includes(termo) ||
        oficinaNome.toLowerCase().includes(termo)
      );
    });
  }, [manutencoes, busca]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Manutenções
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary btn-export-excel"
            onClick={() => exportarManutencoesExcel(manutencoes)}
            title="Exportar Filtrados para Excel"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            className="btn-secondary btn-export-pdf"
            onClick={() => exportarManutencoesPDF(manutencoes)}
            title="Exportar Filtrados para PDF"
          >
            <FileText size={18} /> PDF
          </button>

          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Nova Manutenção
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
          placeholder="Buscar por placa, modelo ou oficina..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Veículo</th>
              <th>Tipo</th>
              <th>Oficina</th>
              <th>KM Atual</th>
              <th>Custo Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {manutencoesFiltradas.length > 0 ? (
              manutencoesFiltradas.map((m) => {
                const dataFormatada = m.data_manutencao
                  ? new Date(m.data_manutencao).toLocaleDateString('pt-BR')
                  : '-';
                const custoFormatado = Number(
                  m.custo_total || 0,
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                });

                return (
                  <tr key={m.id}>
                    <td data-label="Data">{dataFormatada}</td>
                    <td
                      data-label="Veículo"
                      style={{ fontWeight: 'bold', color: '#60a5fa' }}
                    >
                      {m.veiculo_placa}{' '}
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        ({m.veiculo_modelo})
                      </span>
                    </td>
                    <td data-label="Tipo">
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            m.tipo_manutencao === 'PREVENTIVA'
                              ? '#1e3a8a'
                              : '#7f1d1d',
                          color:
                            m.tipo_manutencao === 'PREVENTIVA'
                              ? '#93c5fd'
                              : '#fca5a5',
                          fontWeight: 'bold',
                        }}
                      >
                        {m.tipo_manutencao}
                      </span>
                    </td>
                    <td data-label="Oficina">{m.oficina || '-'}</td>
                    <td data-label="KM Atual">
                      {m.km_atual
                        ? `${Number(m.km_atual).toLocaleString('pt-BR')} km`
                        : '-'}
                    </td>
                    <td
                      data-label="Custo Total"
                      style={{ fontWeight: 'bold', color: '#34d399' }}
                    >
                      {custoFormatado}
                    </td>
                    <td data-label="Status">
                      {m.status === 'CONCLUIDA' && (
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
                          <CheckCircle2 size={14} /> CONCLUÍDA
                        </span>
                      )}
                      {m.status === 'EM_ANDAMENTO' && (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: 'rgba(234, 179, 8, 0.2)',
                            color: '#eab308',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Clock size={14} /> EM ANDAMENTO
                        </span>
                      )}
                      {m.status === 'AGENDADA' && (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <AlertCircle size={14} /> AGENDADA
                        </span>
                      )}
                    </td>
                    <td data-label="Ações" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedManutencao(m);
                            setShowDetalhesModal(true);
                          }}
                          className="btn-icon-primary"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModalEditar(m)}
                          className="btn-icon-secondary"
                          title="Editar Manutenção"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn-icon-danger"
                          title="Excluir Manutenção"
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
                  colSpan="8"
                  style={{ textAlign: 'center', padding: '24px' }}
                >
                  Nenhuma manutenção registrada.
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
                <Wrench size={22} style={{ marginRight: '8px' }} />
                {editingId ? 'Editar Manutenção' : 'Nova Manutenção'}
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
                    Veículo *
                  </label>
                  <select
                    className="input-control"
                    value={veiculoId}
                    onChange={(e) => setVeiculoId(e.target.value)}
                    required
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
                    Tipo de Manutenção *
                  </label>
                  <select
                    className="input-control"
                    value={tipoManutencao}
                    onChange={(e) => setTipoManutencao(e.target.value)}
                    required
                  >
                    <option value="PREVENTIVA">Preventiva</option>
                    <option value="CORRETIVA">Corretiva</option>
                  </select>
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
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="AGENDADA">Agendada</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Data do Serviço *
                  </label>
                  <input
                    type="date"
                    className="input-control"
                    value={dataManutencao}
                    onChange={(e) => setDataManutencao(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    KM Atual do Veículo *
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    placeholder="Ex: 54000"
                    value={kmAtual}
                    onChange={(e) => setKmAtual(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Oficina / Fornecedor
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Nome da oficina"
                    value={oficina}
                    onChange={(e) => setOficina(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Valor Mão de Obra (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="0.00"
                    value={valorMaoObra}
                    onChange={(e) => setValorMaoObra(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Valor das Peças (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="0.00"
                    value={valorPecas}
                    onChange={(e) => setValorPecas(e.target.value)}
                  />
                </div>
              </div>

              {/* Custo Total Calculado */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Custo Total Calculado:
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>
                  {custoTotalCalculado.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Descrição dos Serviços / Peças Trocadas
                </label>
                <textarea
                  className="input-control"
                  rows={3}
                  placeholder="Detalhe o que foi feito..."
                  value={descricaoServico}
                  onChange={(e) => setDescricaoServico(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Próxima Revisão (KM)
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    placeholder="Ex: 60000"
                    value={proximaKm}
                    onChange={(e) => setProximaKm(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Próxima Revisão (Data)
                  </label>
                  <input
                    type="date"
                    className="input-control"
                    value={proximaData}
                    onChange={(e) => setProximaData(e.target.value)}
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
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Manutenção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {selectedManutencao && showDetalhesModal && (
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
              <h2>Detalhes da Manutenção #{selectedManutencao.id}</h2>
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
                <strong>Veículo:</strong> {selectedManutencao.veiculo_placa} -{' '}
                {selectedManutencao.veiculo_modelo}
              </div>
              <div>
                <strong>Tipo:</strong> {selectedManutencao.tipo_manutencao}
              </div>
              <div>
                <strong>Status:</strong> {selectedManutencao.status}
              </div>
              <div>
                <strong>Data:</strong>{' '}
                {new Date(
                  selectedManutencao.data_manutencao,
                ).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <strong>KM Atual:</strong>{' '}
                {Number(selectedManutencao.km_atual).toLocaleString('pt-BR')} km
              </div>
              <div>
                <strong>Oficina:</strong> {selectedManutencao.oficina || '-'}
              </div>
              <div>
                <strong>Mão de Obra:</strong>{' '}
                {Number(selectedManutencao.valor_mao_obra || 0).toLocaleString(
                  'pt-BR',
                  { style: 'currency', currency: 'BRL' },
                )}
              </div>
              <div>
                <strong>Peças:</strong>{' '}
                {Number(selectedManutencao.valor_pecas || 0).toLocaleString(
                  'pt-BR',
                  { style: 'currency', currency: 'BRL' },
                )}
              </div>
              <div>
                <strong>Custo Total:</strong>{' '}
                <span style={{ color: '#34d399', fontWeight: 'bold' }}>
                  {Number(selectedManutencao.custo_total || 0).toLocaleString(
                    'pt-BR',
                    { style: 'currency', currency: 'BRL' },
                  )}
                </span>
              </div>
              <div>
                <strong>Descrição:</strong>{' '}
                {selectedManutencao.descricao_servico || '-'}
              </div>
              <div>
                <strong>Próxima Revisão (KM/Data):</strong>{' '}
                {selectedManutencao.proxima_km
                  ? `${selectedManutencao.proxima_km} km`
                  : '-'}{' '}
                /{' '}
                {selectedManutencao.proxima_data
                  ? new Date(
                      selectedManutencao.proxima_data,
                    ).toLocaleDateString('pt-BR')
                  : '-'}
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
