import React, { useState, useEffect } from 'react';
import {
  getAbastecimentos,
  createAbastecimento,
  deleteAbastecimento,
} from '../services/abastecimentoService';
import { getVeiculos } from '../services/veiculoService';
import { getMotoristas } from '../services/motoristaService';
import { Trash2, Plus } from 'lucide-react';

export default function Abastecimentos() {
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  const [veiculoId, setVeiculoId] = useState('');
  const [motoristaId, setMotoristaId] = useState('');
  const [dataAbastecimento, setDataAbastecimento] = useState('');
  const [kmAbastecimento, setKmAbastecimento] = useState('');
  const [litros, setLitros] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [posto, setPosto] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState('GASOLINA');

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

  const handleLitrosChange = (val) => {
    setLitros(val);
    if (val && valorUnitario) {
      setValorTotal((parseFloat(val) * parseFloat(valorUnitario)).toFixed(2));
    }
  };

  const handleUnitarioChange = (val) => {
    setValorUnitario(val);
    if (val && litros) {
      setValorTotal((parseFloat(litros) * parseFloat(val)).toFixed(2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAbastecimento({
        veiculo_id: Number(veiculoId),
        motorista_id: motoristaId ? Number(motoristaId) : null,
        data_abastecimento: dataAbastecimento,
        km_abastecimento: Number(kmAbastecimento),
        litros: Number(litros.toString().replace(',', '.')),
        valor_unitario: Number(valorUnitario.toString().replace(',', '.')),
        valor_total: Number(valorTotal.toString().replace(',', '.')),
        posto,
        tipo_combustivel: tipoCombustivel,
      });

      setVeiculoId('');
      setMotoristaId('');
      setDataAbastecimento('');
      setKmAbastecimento('');
      setLitros('');
      setValorUnitario('');
      setValorTotal('');
      setPosto('');
      setTipoCombustivel('GASOLINA');

      carregarDados();
    } catch (err) {
      const detalheErro =
        err.response?.data?.erro ||
        err.response?.data?.mensagem ||
        err.message ||
        'Erro desconhecido.';
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
      <h1 className="page-title">Gestão de Abastecimentos</h1>

      {/* FORMULÁRIO COM CLASSE GLOBAL */}
      <form onSubmit={handleSubmit} className="form-grid">
        <select
          className="input-control"
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          required
        >
          <option value="">Selecione o Veículo *</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} - {v.modelo}
            </option>
          ))}
        </select>

        <select
          className="input-control"
          value={motoristaId}
          onChange={(e) => setMotoristaId(e.target.value)}
        >
          <option value="">Motorista (Opcional)</option>
          {motoristas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>

        <input
          className="input-control"
          type="date"
          value={dataAbastecimento}
          onChange={(e) => setDataAbastecimento(e.target.value)}
          required
        />

        <input
          className="input-control"
          placeholder="KM *"
          type="number"
          value={kmAbastecimento}
          onChange={(e) => setKmAbastecimento(e.target.value)}
          required
        />

        <select
          className="input-control"
          value={tipoCombustivel}
          onChange={(e) => setTipoCombustivel(e.target.value)}
        >
          <option value="GASOLINA">Gasolina</option>
          <option value="ETANOL">Etanol</option>
          <option value="DIESEL">Diesel</option>
          <option value="GNV">GNV</option>
        </select>

        <input
          className="input-control"
          placeholder="Litros *"
          type="number"
          step="0.01"
          value={litros}
          onChange={(e) => handleLitrosChange(e.target.value)}
          required
        />

        <input
          className="input-control"
          placeholder="Preço/L (R$) *"
          type="number"
          step="0.001"
          value={valorUnitario}
          onChange={(e) => handleUnitarioChange(e.target.value)}
          required
        />

        <input
          className="input-control"
          placeholder="Total (R$) *"
          type="number"
          step="0.01"
          value={valorTotal}
          onChange={(e) => setValorTotal(e.target.value)}
          required
        />

        <input
          className="input-control"
          placeholder="Posto / Local"
          value={posto}
          onChange={(e) => setPosto(e.target.value)}
        />

        <button
          type="submit"
          className="btn-primary"
          style={{ gridColumn: '1 / -1' }}
        >
          <Plus size={16} /> Registrar Abastecimento
        </button>
      </form>

      {/* TABELA COM CLASSES DO CSS GLOBAL */}
      <div className="table-container">
        <table className="custom-table" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th>Veículo</th>
              <th>Data</th>
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
                  {a.placa || a.veiculo_id}
                </td>
                <td>
                  {a.data_abastecimento
                    ? new Date(a.data_abastecimento).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td>{a.tipo_combustivel || '-'}</td>
                <td>{a.litros} L</td>
                <td>R$ {Number(a.valor_unitario || 0).toFixed(2)}</td>
                <td>R$ {Number(a.valor_total || 0).toFixed(2)}</td>
                <td>{a.km_abastecimento} km</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger-red)',
                      cursor: 'pointer',
                    }}
                    title="Remover Abastecimento"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
