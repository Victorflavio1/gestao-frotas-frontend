import React, { useState, useEffect } from 'react';
import {
  getMotoristas,
  createMotorista,
  deleteMotorista,
} from '../services/motoristaService';
import { Trash2, Plus } from 'lucide-react';

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnh, setCnh] = useState('');
  const [categoriaCnh, setCategoriaCnh] = useState('B');

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
      await createMotorista({ nome, cpf, cnh, categoria_cnh: categoriaCnh });
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
    <>
      <h1 className="page-title">Gestão de Motoristas</h1>

      {/* FORMULÁRIO COM CLASSE GLOBAL */}
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          className="input-control"
          placeholder="Nome Completo *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className="input-control"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <input
          className="input-control"
          placeholder="CNH"
          value={cnh}
          onChange={(e) => setCnh(e.target.value)}
        />
        <select
          className="input-control"
          value={categoriaCnh}
          onChange={(e) => setCategoriaCnh(e.target.value)}
        >
          <option value="A">Cat. A</option>
          <option value="B">Cat. B</option>
          <option value="C">Cat. C</option>
          <option value="D">Cat. D</option>
          <option value="E">Cat. E</option>
          <option value="AB">Cat. AB</option>
        </select>

        <button
          type="submit"
          className="btn-primary"
          style={{ gridColumn: '1 / -1' }}
        >
          <Plus size={16} /> Cadastrar Motorista
        </button>
      </form>

      {/* TABELA COM CLASSES DO CSS GLOBAL */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>CNH</th>
              <th>Categoria</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {motoristas.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td style={{ fontWeight: 'bold' }}>{m.nome}</td>
                <td>{m.cpf || '-'}</td>
                <td>{m.cnh || '-'}</td>
                <td>{m.categoria_cnh || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(m.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger-red)',
                      cursor: 'pointer',
                    }}
                    title="Excluir Motorista"
                  >
                    <Trash2 size={18} />
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
