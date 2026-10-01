import React, { useState, useEffect } from 'react';
import {
  getVeiculos,
  createVeiculo,
  deleteVeiculo,
} from '../services/veiculoService';
import { Trash2, Plus, X } from 'lucide-react';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Estados do Formulário
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [renavam, setRenavam] = useState('');
  const [chassi, setChassi] = useState('');
  const [kmAtual, setKmAtual] = useState('');

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
        ano: ano ? Number(ano) : null,
        cor,
        renavam,
        chassi,
        km_atual: kmAtual ? Number(kmAtual) : 0,
      });

      alert('Veículo cadastrado com sucesso!');
      
      // Limpa formulário e fecha modal
      setPlaca('');
      setModelo('');
      setMarca('');
      setAno('');
      setCor('');
      setRenavam('');
      setChassi('');
      setKmAtual('');
      setShowModal(false);

      carregarVeiculos();
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao cadastrar veículo.';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente remover este veículo?')) {
      try {
        await deleteVeiculo(id);
        carregarVeiculos();
      } catch (err) {
        alert('Erro ao excluir veículo.');
      }
    }
  };

  return (
    <>
      {/* Cabeçalho da Página com Botão Novo */}
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Veículos
        </h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Novo Veículo
        </button>
      </div>

      {/* Tabela de Listagem */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Marca</th>
              <th>Ano</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {veiculos.map((v) => (
              <tr key={v.id}>
                <td data-label="ID">{v.id}</td>
                <td data-label="Placa" style={{ fontWeight: 'bold', color: '#60a5fa' }}>
                  {v.placa}
                </td>
                <td data-label="Modelo">{v.modelo}</td>
                <td data-label="Marca">{v.marca || '-'}</td>
                <td data-label="Ano">{v.ano || '-'}</td>
                <td data-label="Ações" style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="btn-icon-danger"
                    title="Excluir Veículo"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POP-UP / MODAL DE CADASTRO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cadastrar Novo Veículo</h2>
              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <input
                className="input-control"
                placeholder="Placa *"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                required
              />
              <input
                className="input-control"
                placeholder="Modelo *"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
              />
              <input
                className="input-control"
                placeholder="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
              <input
                className="input-control"
                placeholder="Ano"
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              />
              <input
                className="input-control"
                placeholder="Cor"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
              />
              <input
                className="input-control"
                placeholder="Renavam"
                value={renavam}
                onChange={(e) => setRenavam(e.target.value)}
              />
              <input
                className="input-control"
                placeholder="Chassi"
                value={chassi}
                onChange={(e) => setChassi(e.target.value)}
              />
              <input
                className="input-control"
                placeholder="KM Atual"
                type="number"
                value={kmAtual}
                onChange={(e) => setKmAtual(e.target.value)}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}