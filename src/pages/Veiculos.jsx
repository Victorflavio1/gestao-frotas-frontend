import React, { useState, useEffect } from 'react';
import {
  getVeiculos,
  createVeiculo,
  deleteVeiculo,
} from '../services/veiculoService';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [ano, setAno] = useState('');
  const [renavam, setRenavam] = useState('');
  const [vencimentoCrlv, setVencimentoCrlv] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [status, setStatus] = useState('DISPONIVEL');
  const navigate = useNavigate();

  const carregarVeiculos = async () => {
    try {
      const data = await getVeiculos();
      setVeiculos(data);
    } catch (err) {
      alert('Erro ao carregar veículos.');
    }
  };

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVeiculo({
        placa,
        modelo,
        marca,
        ano: Number(ano),
        renavam,
        vencimento_crlv: vencimentoCrlv,
        km_atual: Number(kmAtual),
        status,
      });

      // Limpa os campos após o sucesso
      setPlaca('');
      setModelo('');
      setMarca('');
      setAno('');
      setRenavam('');
      setVencimentoCrlv('');
      setKmAtual('');
      setStatus('DISPONIVEL');

      carregarVeiculos();
    } catch (err) {
      // Captura a mensagem tratada da API ou exibe a falha de validação/duplicação
      const mensagemErro =
        err.response?.data?.message ||
        'Erro ao cadastrar veículo! Verifique se a placa já está cadastrada.';
      alert(mensagemErro);
    }
  };
  const handleDelete = async (id) => {
    if (confirm('Deseja remover este veículo?')) {
      try {
        await deleteVeiculo(id);
        carregarVeiculos();
      } catch (err) {
        alert('Erro ao excluir veículo.');
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

      <h1 style={{ fontSize: '24px', margin: '20px 0' }}>Gestão de Veículos</h1>

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
        <input
          placeholder="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Modelo"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Ano"
          type="number"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="RENAVAM"
          value={renavam}
          onChange={(e) => setRenavam(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={vencimentoCrlv}
          onChange={(e) => setVencimentoCrlv(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="KM Atual"
          type="number"
          value={kmAtual}
          onChange={(e) => setKmAtual(e.target.value)}
          style={inputStyle}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="DISPONIVEL">Disponível</option>

          <option value="EM_USO">Em Uso</option>
          <option value="MANUTENCAO">Manutenção</option>
        </select>

        <button type="submit" style={{ ...btnPrimary, gridColumn: '1 / -1' }}>
          <Plus size={16} /> Cadastrar Veículo
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
            <th style={thTdStyle}>Placa</th>
            <th style={thTdStyle}>Modelo</th>
            <th style={thTdStyle}>Marca</th>
            <th style={thTdStyle}>Ano</th>
            <th style={thTdStyle}>KM</th>
            <th style={thTdStyle}>Status</th>
            <th style={thTdStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((v) => (
            <tr key={v.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={thTdStyle}>{v.placa}</td>
              <td style={thTdStyle}>{v.modelo}</td>
              <td style={thTdStyle}>{v.marca}</td>
              <td style={thTdStyle}>{v.ano}</td>
              <td style={thTdStyle}>{v.km_atual || 0} km</td>
              <td style={thTdStyle}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor:
                      v.status === 'DISPONIVEL'
                        ? '#166534'
                        : v.status === 'MANUTENCAO'
                          ? '#991b1b'
                          : '#1e40af',
                  }}
                >
                  {v.status}
                </span>
              </td>
              <td style={thTdStyle}>
                <button
                  onClick={() => handleDelete(v.id)}
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
