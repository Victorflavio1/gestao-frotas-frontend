import React, { useState, useEffect } from 'react';
import {
  getAbastecimentos,
  createAbastecimento,
  updateAbastecimento,
  deleteAbastecimento,
} from '../services/abastecimentoService';
import { getVeiculos } from '../services/veiculoService';
import { getMotoristas } from '../services/motoristaService';
import { Trash2, Pencil, Plus, X } from 'lucide-react';

export default function Abastecimentos() {
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estados do Formulário
  const [veiculoId, setVeiculoId] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [dataAbastecimento, setDataAbastecimento] = useState('');
  const [kmAbastecimento, setKmAbastecimento] = useState('');
  const [litros, setLitros] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [posto, setPosto] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState('FLEX');

  const carregarDados = async () => {
    try {
      const [dataAbast, dataVeic, dataMot] = await Promise.all([
        getAbastecimentos(),
        getVeiculos(),
        getMotoristas(),
      ]);
      setAbastecimentos(dataAbast);
      setVeiculos(dataVeic);
      setMotoristas(dataMot);
    } catch (err) {
      alert('Erro ao carregar dados de abastecimentos.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const apenasData = dataStr.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    if (!ano || !mes || !dia) return '-';
    return `${dia}/${mes}/${ano}`;
  };

  const formatarKM = (value) => {
    if (!value) return '';
    const apenasNumeros = value.toString().replace(/\D/g, '');
    if (!apenasNumeros) return '';
    return Number(apenasNumeros).toLocaleString('pt-BR');
  };

  const handleKmChange = (e) => {
    const valorFormatado = formatarKM(e.target.value);
    setKmAbastecimento(valorFormatado);
  };

  const handleOpenModalNovo = () => {
    setEditingId(null);
    setVeiculoId('');
    setMotoristaId('');
    setDataAbastecimento(new Date().toISOString().split('T')[0]);
    setKmAbastecimento('');
    setLitros('');
    setValorUnitario('');
    setValorTotal('');
    setPosto('');
    setTipoCombustivel('FLEX');
    setShowModal(true);
  };

  const handleEdit = (a) => {
    const idParaEditar = a.id || a.id_abastecimento;

    if (!idParaEditar) {
      alert('Erro: ID do abastecimento não foi encontrado.');
      return;
    }

    setEditingId(idParaEditar);
    setVeiculoId(a.veiculo_id || '');
    setMotoristaId(a.motorista_id || '');

    const dataFormatada = a.data_abastecimento
      ? new Date(a.data_abastecimento).toISOString().split('T')[0]
      : '';
    setDataAbastecimento(dataFormatada);

    setKmAbastecimento(
      a.km_abastecimento ? formatarKM(a.km_abastecimento) : '',
    );
    setLitros(a.litros || '');
    setValorUnitario(a.valor_unitario || '');
    setValorTotal(a.valor_total || '');
    setPosto(a.posto || '');
    setTipoCombustivel(a.tipo_combustivel || 'FLEX');
    setShowModal(true);
  };

  const handleLitrosChange = (val) => {
    setLitros(val);
    const l = parseFloat(val.toString().replace(',', '.'));
    const t = parseFloat(valorTotal.toString().replace(',', '.'));
    const u = parseFloat(valorUnitario.toString().replace(',', '.'));

    if (l > 0 && t > 0) {
      setValorUnitario((t / l).toFixed(3));
    } else if (l > 0 && u > 0) {
      setValorTotal((l * u).toFixed(2));
    }
  };

  const handleTotalChange = (val) => {
    setValorTotal(val);
    const t = parseFloat(val.toString().replace(',', '.'));
    const l = parseFloat(litros.toString().replace(',', '.'));

    if (l > 0 && t > 0) {
      setValorUnitario((t / l).toFixed(3));
    } else {
      setValorUnitario('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const kmLimpo = Number(kmAbastecimento.toString().replace(/\D/g, ''));

    const dados = {
      veiculo_id: Number(veiculoId),
      motorista_id: motoristaId ? Number(motoristaId) : null,
      data_abastecimento: dataAbastecimento,
      km_abastecimento: kmLimpo,
      litros: Number(litros.toString().replace(',', '.')),
      valor_unitario: Number(valorUnitario.toString().replace(',', '.')),
      valor_total: Number(valorTotal.toString().replace(',', '.')),
      posto,
      tipo_combustivel: tipoCombustivel,
    };

    try {
      if (editingId) {
        await updateAbastecimento(editingId, dados);
        alert('Abastecimento atualizado com sucesso!');
      } else {
        await createAbastecimento(dados);
        alert('Abastecimento registrado com sucesso!');
      }

      setShowModal(false);
      carregarDados();
    } catch (err) {
      const detalheErro =
        err.response?.data?.erro ||
        err.response?.data?.mensagem ||
        err.message ||
        'Erro ao salvar abastecimento.';
      alert(`Atenção: ${detalheErro}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja remover este registro de abastecimento?')) {
      try {
        await deleteAbastecimento(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir abastecimento.');
      }
    }
  };

  return (
    <>
      <style>{`
        .table-container-responsive {
          width: 100%;
        }

        .desktop-view {
          display: block;
          width: 100%;
        }

        .mobile-view {
          display: none;
        }

        @media (max-width: 900px) {
          .desktop-view {
            display: none !important;
          }

          .mobile-view {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }

          .abast-card {
            background-color: #1e293b;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
          }

          .abast-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 8px;
            margin-bottom: 12px;
          }

          .abast-card-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 12px;
            font-size: 0.9rem;
          }

          .abast-field-label {
            color: #94a3b8;
            font-size: 0.75rem;
            display: block;
            margin-bottom: 2px;
          }

          .abast-card-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Abastecimentos
        </h1>
        <button className="btn-primary" onClick={handleOpenModalNovo}>
          <Plus size={18} /> Novo Abastecimento
        </button>
      </div>

      <div className="table-container-responsive">
        {/* TABELA DE DESKTOP */}
        <div className="desktop-view table-container">
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Motorista</th>
                <th>Data</th>
                <th>Posto</th>
                <th>Combustível</th>
                <th>Litros</th>
                <th>R$/L</th>
                <th>Total</th>
                <th>KM</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {abastecimentos.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 'bold', color: '#60a5fa' }}>
                    {a.placa || a.veiculo_placa || a.veiculo_id}
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {a.motorista_nome || a.motorista || '-'}
                  </td>
                  <td>{formatarData(a.data_abastecimento)}</td>
                  <td>{a.posto_nome || a.posto || '-'}</td>
                  <td>{a.tipo_combustivel || '-'}</td>
                  <td>{a.litros} L</td>
                  <td>R$ {Number(a.valor_unitario || 0).toFixed(2)}</td>
                  <td>R$ {Number(a.valor_total || 0).toFixed(2)}</td>
                  <td>
                    {a.km_abastecimento
                      ? `${Number(a.km_abastecimento).toLocaleString('pt-BR')} km`
                      : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(a)}
                        className="btn-icon-primary"
                        title="Editar Abastecimento"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="btn-icon-danger"
                        title="Remover Abastecimento"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARDS APENAS NO MOBILE */}
        <div className="mobile-view">
          {abastecimentos.map((a) => (
            <div key={a.id} className="abast-card">
              <div className="abast-card-header">
                <span
                  style={{
                    fontWeight: 'bold',
                    color: '#60a5fa',
                    fontSize: '1.1rem',
                  }}
                >
                  {a.placa || a.veiculo_placa || a.veiculo_id}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {formatarData(a.data_abastecimento)}
                </span>
              </div>

              <div className="abast-card-grid">
                <div>
                  <span className="abast-field-label">Motorista</span>
                  <strong>{a.motorista_nome || a.motorista || '-'}</strong>
                </div>

                <div>
                  <span className="abast-field-label">Posto</span>
                  <strong>{a.posto_nome || a.posto || '-'}</strong>
                </div>

                <div>
                  <span className="abast-field-label">
                    Combustível / Litros
                  </span>
                  <strong>
                    {a.tipo_combustivel || '-'} ({a.litros} L)
                  </strong>
                </div>

                <div>
                  <span className="abast-field-label">Valor Total</span>
                  <strong style={{ color: '#4ade80' }}>
                    R$ {Number(a.valor_total || 0).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span className="abast-field-label">Preço/Litro</span>
                  <span>R$ {Number(a.valor_unitario || 0).toFixed(2)}</span>
                </div>

                <div>
                  <span className="abast-field-label">Quilometragem</span>
                  <span>
                    {a.km_abastecimento
                      ? `${Number(a.km_abastecimento).toLocaleString('pt-BR')} km`
                      : '-'}
                  </span>
                </div>
              </div>

              <div className="abast-card-actions">
                <button
                  onClick={() => handleEdit(a)}
                  className="btn-icon-primary"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="btn-icon-danger"
                  title="Remover"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingId ? 'Editar Abastecimento' : 'Registrar Abastecimento'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              {/* Veículo */}
              <div className="form-group">
                <label className="form-label">
                  Veículo <span className="required-star">*</span>
                </label>
                <select
                  className="input-control"
                  value={veiculoId}
                  onChange={(e) => setVeiculoId(e.target.value)}
                  required
                >
                  <option value="">Selecione o Veículo</option>
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} (KM Atual:{' '}
                      {v.km_atual
                        ? Number(v.km_atual).toLocaleString('pt-BR')
                        : 0}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Motorista */}
              <div className="form-group">
                <label className="form-label">Motorista</label>
                <select
                  className="input-control"
                  value={motoristaId}
                  onChange={(e) => setMotoristaId(e.target.value)}
                >
                  <option value="">Selecione (Opcional)</option>
                  {motoristas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data */}
              <div className="form-group">
                <label className="form-label">
                  Data do Abastecimento <span className="required-star">*</span>
                </label>
                <input
                  className="input-control"
                  type="date"
                  value={dataAbastecimento}
                  onChange={(e) => setDataAbastecimento(e.target.value)}
                  required
                />
              </div>

              {/* KM Atual */}
              <div className="form-group">
                <label className="form-label">
                  KM Atual <span className="required-star">*</span>
                </label>
                <input
                  className="input-control"
                  placeholder="Ex: 125.523"
                  type="text"
                  value={kmAbastecimento}
                  onChange={handleKmChange}
                  required
                />
              </div>

              {/* Combustível */}
              <div className="form-group">
                <label className="form-label">Tipo de Combustível</label>
                <select
                  className="input-control"
                  value={tipoCombustivel}
                  onChange={(e) => setTipoCombustivel(e.target.value)}
                >
                  <option value="FLEX">FLEX</option>
                  <option value="GASOLINA">GASOLINA</option>
                  <option value="DIESEL S10">DIESEL S10</option>
                  <option value="DIESEL S500">DIESEL S500</option>
                  <option value="ETANOL">ETANOL</option>
                  <option value="ELÉTRICO">ELÉTRICO</option>
                  <option value="HÍBRIDO">HÍBRIDO</option>
                  <option value="GNV">GNV</option>
                </select>
              </div>

              {/* Litros */}
              <div className="form-group">
                <label className="form-label">
                  Litros <span className="required-star">*</span>
                </label>
                <input
                  className="input-control"
                  placeholder="0.00"
                  type="number"
                  step="0.001"
                  value={litros}
                  onChange={(e) => handleLitrosChange(e.target.value)}
                  required
                />
              </div>

              {/* Preço por Litro */}
              <div className="form-group">
                <label className="form-label">Preço / Litro (Calculado)</label>
                <input
                  className="input-control"
                  placeholder="Auto"
                  type="number"
                  step="0.001"
                  value={valorUnitario}
                  readOnly
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              {/* Valor Total */}
              <div className="form-group">
                <label className="form-label">
                  Valor Total (R$) <span className="required-star">*</span>
                </label>
                <input
                  className="input-control"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={valorTotal}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  required
                />
              </div>

              {/* Posto / Local */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Posto / Localização</label>
                <input
                  className="input-control"
                  placeholder="Ex: Posto Shell Centenário"
                  value={posto}
                  onChange={(e) => setPosto(e.target.value)}
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
                  {editingId
                    ? 'Atualizar Abastecimento'
                    : 'Salvar Abastecimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
