import React, { useState, useEffect } from 'react';
import {
  getMotoristas,
  createMotorista,
  deleteMotorista,
} from '../services/motoristaService';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnh, setCnh] = useState('');
  const [categoriaCnh, setCategoriaCnh] = useState('B');

  const navigate = useNavigate();

  const carregarMotoristas = async () => {
    try {
      const data = await getMotoristas();
      setMotoristas(data);
    } catch (err) {
      const msg =
        err.response?.data?.erro || err.response?.data?.mensagem || err.message;
      alert(`Erro ao carregar motoristas: ${msg}`);
    }
  };

  useEffect(() => {
    carregarMotoristas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMotorista({
        nome,
        cpf,
        cnh,
        categoria_cnh: categoriaCnh,
      });

      alert('Motorista cadastrado com sucesso!');
      setNome('');
      setCpf('');
      setCnh('');
      setCategoriaCnh('B');
      carregarMotoristas();
    } catch (err) {
      const msg =
        err.response?.data?.erro || err.response?.data?.mensagem || err.message;
      alert(`Erro: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este motorista?')) {
      try {
        await deleteMotorista(id);
        alert('Motorista removido com sucesso!');
        carregarMotoristas();
      } catch (err) {
        const msg =
          err.response?.data?.erro ||
          err.response?.data?.mensagem ||
          err.message;
        alert(`Erro ao excluir: ${msg}`);
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
        Gestão de Motoristas
      </h1>

      {/* Formulário de Cadastro */}
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
          placeholder="Nome Completo *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="CNH"
          value={cnh}
          onChange={(e) => setCnh(e.target.value)}
          style={inputStyle}
        />
        <select
          value={categoriaCnh}
          onChange={(e) => setCategoriaCnh(e.target.value)}
          style={inputStyle}
        >
          <option value="A">Cat. A</option>
          <option value="B">Cat. B</option>
          <option value="C">Cat. C</option>
          <option value="D">Cat. D</option>
          <option value="E">Cat. E</option>
          <option value="AB">Cat. AB</option>
        </select>

        <button type="submit" style={{ ...btnPrimary, gridColumn: '1 / -1' }}>
          <Plus size={16} /> Cadastrar Motorista
        </button>
      </form>

      {/* Tabela de Listagem */}
      <div style={{ overflowX: 'auto' }}>
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
              <th style={thTdStyle}>ID</th>
              <th style={thTdStyle}>Nome</th>
              <th style={thTdStyle}>CPF</th>
              <th style={thTdStyle}>CNH</th>
              <th style={thTdStyle}>Categoria</th>
              <th style={thTdStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {motoristas.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={thTdStyle}>{m.id}</td>
                <td style={thTdStyle}>{m.nome}</td>
                <td style={thTdStyle}>{m.cpf || '-'}</td>
                <td style={thTdStyle}>{m.cnh || '-'}</td>
                <td style={thTdStyle}>{m.categoria_cnh || '-'}</td>
                <td style={thTdStyle}>
                  <button
                    onClick={() => handleDelete(m.id)}
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
const thTdStyle = { padding: '12px 15px', whiteSpace: 'nowrap' };
