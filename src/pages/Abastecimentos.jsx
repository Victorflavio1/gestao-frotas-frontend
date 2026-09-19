import React, { useState, useEffect } from 'react';
import {
  getAbastecimentos,
  createAbastecimento,
  deleteAbastecimento,
} from '../services/abastecimentoService';
import { getVeiculos } from '../services/veiculoService';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Abastecimentos() {
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [veiculoId, setVeiculoId] = useState('');
  const [dataAbastecimento, setDataAbastecimento] = useState('');
  const [kmAbastecimento, setKmAbastecimento] = useState('');
  const [litros, setLitros] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [posto, setPosto] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState('GASOLINA');

  const navigate = useNavigate();

  const carregarDados = async () => {
    try {
      const [dataAbast, dataVeic] = await Promise.all([
        getAbastecimentos(),
        getVeiculos(),
      ]);
      setAbastecimentos(dataAbast);
      setVeiculos(dataVeic);
    } catch (err) {
      alert('Erro ao carregar dados de abastecimentos.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Cálculo automático do valor total quando litros ou valor unitário mudam
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
        data_abastecimento: dataAbastecimento,
        km_abastecimento: Number(kmAbastecimento),
        litros: Number(litros.toString().replace(',', '.')),
        valor_unitario: Number(valorUnitario.toString().replace(',', '.')),
        valor_total: Number(valorTotal.toString().replace(',', '.')),
        posto,
        tipo_combustivel: tipoCombustivel,
      });

      // Limpar campos
      setVeiculoId('');
      setDataAbastecimento('');
      setKmAbastecimento('');
      setLitros('');
      setValorUnitario('');
      setValorTotal('');
      setPosto('');
      setTipoCombustivel('GASOLINA');

      carregarDados();
    } catch (err) {
      // Exibe exatamente a mensagem do 'erro' que veio do servidor na aba Network
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
    <div
      style={{
        padding: '30px',
        backgroundColor: '#0f172a',
        minHeight: '100vh',
        color: '#f8fafc',
        fontFamily: 'sans-serif',
      }}
    >
      <button onClick={() => navigate('/dashboard')} style={btnSecondary}>
        <ArrowLeft size={16} /> Voltar ao Dashboard
      </button>

      <h1 style={{ fontSize: '24px', margin: '20px 0' }}>
        Gestão de Abastecimentos
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#1e293b',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
        }}
      >
        <select
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Selecione o Veículo</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} - {v.modelo}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dataAbastecimento}
          onChange={(e) => setDataAbastecimento(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="KM Atual"
          type="number"
          value={kmAbastecimento}
          onChange={(e) => setKmAbastecimento(e.target.value)}
          required
          style={inputStyle}
        />

        <select
          value={tipoCombustivel}
          onChange={(e) => setTipoCombustivel(e.target.value)}
          style={inputStyle}
        >
          <option value="GASOLINA">Gasolina</option>
          <option value="ETANOL">Etanol</option>
          <option value="DIESEL">Diesel</option>
          <option value="GNV">GNV</option>
        </select>

        <input
          placeholder="Litros"
          type="number"
          step="0.01"
          value={litros}
          onChange={(e) => handleLitrosChange(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Preço/L (R$)"
          type="number"
          step="0.001"
          value={valorUnitario}
          onChange={(e) => handleUnitarioChange(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Valor Total (R$)"
          type="number"
          step="0.01"
          value={valorTotal}
          onChange={(e) => setValorTotal(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Posto / Local"
          value={posto}
          onChange={(e) => setPosto(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={{ ...btnPrimary, gridColumn: '1 / -1' }}>
          <Plus size={16} /> Registrar Abastecimento
        </button>
      </form>

      {/* Tabela */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#334155', textAlign: 'left' }}>
            <th style={thTdStyle}>Veículo</th>
            <th style={thTdStyle}>Data</th>
            <th style={thTdStyle}>Combustível</th>
            <th style={thTdStyle}>Litros</th>
            <th style={thTdStyle}>R$/L</th>
            <th style={thTdStyle}>Total (R$)</th>
            <th style={thTdStyle}>KM</th>
            <th style={thTdStyle}>Posto</th>
            <th style={thTdStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {abastecimentos.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={thTdStyle}>{a.placa || a.veiculo_id}</td>
              <td style={thTdStyle}>
                {a.data_abastecimento
                  ? new Date(a.data_abastecimento).toLocaleDateString('pt-BR')
                  : '-'}
              </td>
              <td style={thTdStyle}>{a.tipo_combustivel || '-'}</td>
              <td style={thTdStyle}>{a.litros} L</td>
              <td style={thTdStyle}>
                R$ {Number(a.valor_unitario || 0).toFixed(2)}
              </td>
              <td style={thTdStyle}>
                R$ {Number(a.valor_total || 0).toFixed(2)}
              </td>
              <td style={thTdStyle}>{a.km_abastecimento} km</td>
              <td style={thTdStyle}>{a.posto || '-'}</td>
              <td style={thTdStyle}>
                <button
                  onClick={() => handleDelete(a.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Adcionando os estados para motoristas
  const [motoristas, setMotoristas] = useState([]);
  const [motoristaId, setMotoristaId] = useState('');

  useEffect(() => {
    const carregarMotoristas = async () => {
      try {
        const data = await getMotoristas();
        setMotoristas(data);
      } catch (err) {
        console.error('Erro ao carregar motoristas:', err);
      }
    };

    carregarDados();
    carregarMotoristas();
  }, []);

  // 3. Adicione o campo Select no formulário JSX
  <select
    value={motoristaId}
    onChange={(e) => setMotoristaId(e.target.value)}
    style={inputStyle}
  >
    <option value="">Selecione o Motorista (Opcional)</option>
    {motoristas.map((m) => (
      <option key={m.id} value={m.id}>
        {m.nome} {m.cnh ? `(CNH: ${m.cnh})` : ''}
      </option>
    ))}
  </select>;
}

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #334155',
  backgroundColor: '#0f172a',
  color: '#fff',
};
const btnPrimary = {
  padding: '10px 15px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
};
const btnSecondary = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#334155',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
};
const thTdStyle = { padding: '12px 15px' };
