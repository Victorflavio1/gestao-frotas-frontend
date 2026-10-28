import React, { useState, useEffect, useMemo } from 'react';
import {
  getMultas,
  createMulta,
  updateMulta,
  deleteMulta,
} from '../services/multaService';
import { getVeiculos } from '../services/veiculoService';
import { getMotoristas } from '../services/motoristaService';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  AlertOctagon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Eye,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { exportarMultasPDF, exportarMultasExcel } from '../utils/exportUtils';

export default function Multas() {
  const [multas, setMultas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMulta, setSelectedMulta] = useState(null);

  // Campos do Formulário
  const [veiculoId, setVeiculoId] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [autoInfracao, setAutoInfracao] = useState('');
  const [dataInfracao, setDataInfracao] = useState('');
  const [horaInfracao, setHoraInfracao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [descricaoInfracao, setDescricaoInfracao] = useState('');
  const [valor, setValor] = useState('');
  const [pontos, setPontos] = useState('');
  const [status, setStatus] = useState('PENDENTE');
  const [vencimento, setVencimento] = useState('');

  const carregarDados = async () => {
    try {
      const [dataMultas, dataVeic, dataMot] = await Promise.all([
        getMultas().catch(() => []),
        getVeiculos().catch(() => []),
        getMotoristas().catch(() => []),
      ]);
      setMultas(dataMultas || []);
      setVeiculos(dataVeic || []);
      setMotoristas(dataMot || []);
    } catch (err) {
      console.error('Erro ao carregar dados de multas:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleOpenModalNovo = () => {
    setEditingId(null);
    setVeiculoId('');
    setMotoristaId('');
    setAutoInfracao('');
    setDataInfracao(new Date().toISOString().split('T')[0]);
    setHoraInfracao('');
    setLocalizacao('');
    setDescricaoInfracao('');
    setValor('');
    setPontos('');
    setStatus('PENDENTE');
    setVencimento('');
    setShowModal(true);
  };

  const handleOpenModalEditar = (m) => {
    setEditingId(m.id);
    setVeiculoId(m.veiculo_id);
    setMotoristaId(m.motorista_id || '');
    setAutoInfracao(m.auto_infracao || '');
    setDataInfracao(m.data_infracao ? m.data_infracao.split('T')[0] : '');
    setHoraInfracao(m.hora_infracao || '');
    setLocalizacao(m.localizacao || '');
    setDescricaoInfracao(m.descricao_infracao || '');
    setValor(m.valor || '');
    setPontos(m.pontos || '');
    setStatus(m.status || 'PENDENTE');
    setVencimento(m.vencimento ? m.vencimento.split('T')[0] : '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      veiculo_id: veiculoId,
      motorista_id: motoristaId ? Number(motoristaId) : null,
      auto_infracao: autoInfracao,
      data_infracao: dataInfracao,
      hora_infracao: horaInfracao || null,
      localizacao,
      descricao_infracao: descricaoInfracao,
      valor: Number(valor) || 0,
      pontos: pontos ? Number(pontos) : 0,
      status,
      vencimento: vencimento || null,
    };

    try {
      if (editingId) {
        await updateMulta(editingId, payload);
        alert('Multa atualizada com sucesso!');
      } else {
        await createMulta(payload);
        alert('Multa cadastrada com sucesso!');
      }
      setShowModal(false);
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar multa.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este registro de multa?')) {
      try {
        await deleteMulta(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir multa.');
      }
    }
  };

  const multasFiltradas = useMemo(() => {
    return multas.filter((m) => {
      const termo = busca.toLowerCase();
      const placa = m.veiculo_placa || '';
      const auto = m.auto_infracao || '';
      const motorista = m.motorista_nome || '';
      return (
        placa.toLowerCase().includes(termo) ||
        auto.toLowerCase().includes(termo) ||
        motorista.toLowerCase().includes(termo)
      );
    });
  }, [multas, busca]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Multas e Infrações
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary btn-export-excel"
            onClick={() => exportarMultasExcel(multas)}
            title="Exportar Filtrados para Excel"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            className="btn-secondary btn-export-pdf"
            onClick={() => exportarMultasPDF(multas)}
            title="Exportar Filtrados para PDF"
          >
            <FileText size={18} /> PDF
          </button>

          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Nova Multa
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
          placeholder="Buscar por placa, auto ou motorista..."
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
              <th>Auto / Infração</th>
              <th>Veículo</th>
              <th>Motorista</th>
              <th>Valor</th>
              <th>Pontos</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {multasFiltradas.length > 0 ? (
              multasFiltradas.map((m) => {
                const dataFormatada = m.data_infracao
                  ? new Date(m.data_infracao).toLocaleDateString('pt-BR')
                  : '-';
                const valorFormatado = Number(m.valor || 0).toLocaleString(
                  'pt-BR',
                  {
                    style: 'currency',
                    currency: 'BRL',
                  },
                );

                return (
                  <tr key={m.id}>
                    <td data-label="Data">{dataFormatada}</td>
                    <td data-label="Auto" style={{ fontWeight: 'bold' }}>
                      {m.auto_infracao}
                    </td>
                    <td data-label="Veículo" style={{ color: '#60a5fa' }}>
                      {m.veiculo_placa}{' '}
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        ({m.veiculo_modelo})
                      </span>
                    </td>
                    <td data-label="Motorista">
                      {m.motorista_nome || (
                        <span style={{ color: '#94a3b8' }}>Não informado</span>
                      )}
                    </td>
                    <td
                      data-label="Valor"
                      style={{ fontWeight: 'bold', color: '#f87171' }}
                    >
                      {valorFormatado}
                    </td>
                    <td data-label="Pontos">{m.pontos} pts</td>
                    <td data-label="Status">
                      {m.status === 'PAGA' && (
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
                          <CheckCircle2 size={14} /> PAGA
                        </span>
                      )}
                      {m.status === 'PENDENTE' && (
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
                          <Clock size={14} /> PENDENTE
                        </span>
                      )}
                      {m.status === 'RECURSO' && (
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
                          <AlertTriangle size={14} /> RECURSO
                        </span>
                      )}
                    </td>
                    <td data-label="Ações" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedMulta(m);
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
                          title="Editar Multa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn-icon-danger"
                          title="Excluir Multa"
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
                  Nenhuma multa registrada.
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
                <AlertOctagon size={22} style={{ marginRight: '8px' }} />
                {editingId ? 'Editar Multa' : 'Nova Multa'}
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
                    Motorista Responsável
                  </label>
                  <select
                    className="input-control"
                    value={motoristaId}
                    onChange={(e) => setMotoristaId(e.target.value)}
                  >
                    <option value="">Nenhum / Não identificado</option>
                    {motoristas.map((mot) => (
                      <option key={mot.id} value={mot.id}>
                        {mot.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Auto de Infração *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: A123456789"
                    value={autoInfracao}
                    onChange={(e) => setAutoInfracao(e.target.value)}
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
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGA">Paga</option>
                    <option value="RECURSO">Em Recurso</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Data da Infração *
                  </label>
                  <input
                    type="date"
                    className="input-control"
                    value={dataInfracao}
                    onChange={(e) => setDataInfracao(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Hora da Infração
                  </label>
                  <input
                    type="time"
                    className="input-control"
                    value={horaInfracao}
                    onChange={(e) => setHoraInfracao(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="0.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Pontos na CNH
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    placeholder="Ex: 4"
                    value={pontos}
                    onChange={(e) => setPontos(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Localização
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Ex: Av. Brasil, 1500"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Descrição / Infração Cometida
                </label>
                <textarea
                  className="input-control"
                  rows={2}
                  placeholder="Detalhes da infração..."
                  value={descricaoInfracao}
                  onChange={(e) => setDescricaoInfracao(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  className="input-control"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
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
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Multa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {selectedMulta && showDetalhesModal && (
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
              <h2>Detalhes da Multa #{selectedMulta.auto_infracao}</h2>
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
                <strong>Veículo:</strong> {selectedMulta.veiculo_placa} -{' '}
                {selectedMulta.veiculo_modelo}
              </div>
              <div>
                <strong>Motorista:</strong>{' '}
                {selectedMulta.motorista_nome || 'Não informado'}
              </div>
              <div>
                <strong>Auto de Infração:</strong> {selectedMulta.auto_infracao}
              </div>
              <div>
                <strong>Status:</strong> {selectedMulta.status}
              </div>
              <div>
                <strong>Data/Hora:</strong>{' '}
                {new Date(selectedMulta.data_infracao).toLocaleDateString(
                  'pt-BR',
                )}{' '}
                {selectedMulta.hora_infracao
                  ? `às ${selectedMulta.hora_infracao}`
                  : ''}
              </div>
              <div>
                <strong>Local:</strong> {selectedMulta.localizacao || '-'}
              </div>
              <div>
                <strong>Valor:</strong>{' '}
                <span style={{ color: '#f87171', fontWeight: 'bold' }}>
                  {Number(selectedMulta.valor || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div>
                <strong>Pontos na CNH:</strong> {selectedMulta.pontos} pts
              </div>
              <div>
                <strong>Vencimento:</strong>{' '}
                {selectedMulta.vencimento
                  ? new Date(selectedMulta.vencimento).toLocaleDateString(
                      'pt-BR',
                    )
                  : '-'}
              </div>
              <div>
                <strong>Descrição:</strong>{' '}
                {selectedMulta.descricao_infracao || '-'}
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
