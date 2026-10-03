import React, { useState, useEffect } from 'react';
import {
  getVeiculos,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
} from '../services/veiculoService';
import { Trash2, Pencil, Plus, X } from 'lucide-react';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID do veículo em edição

  const anoAtual = new Date().getFullYear();

  // Estados do Formulário
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [renavam, setRenavam] = useState('');
  const [chassi, setChassi] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [anoCrlv, setAnoCrlv] = useState('');
  const [status, setStatus] = useState('DISPONIVEL');
  const [numeracao, setNumeracao] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState('FLEX');
  const [tipoVeiculo, setTipoVeiculo] = useState('Carro');

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

  // Limpa o formulário e reseta o estado de edição
  const handleOpenModalNovo = () => {
    setEditingId(null);
    setPlaca('');
    setModelo('');
    setMarca('');
    setAno('');
    setCor('');
    setRenavam('');
    setChassi('');
    setKmAtual('');
    setAnoCrlv('');
    setStatus('DISPONIVEL');
    setNumeracao('');
    setTipoCombustivel('FLEX');
    setTipoVeiculo('Carro');
    setShowModal(true);
  };

  // Preenche o formulário com os dados do veículo para editar
  const handleEdit = (veiculo) => {
    setEditingId(veiculo.id);
    setPlaca(veiculo.placa || '');
    setModelo(veiculo.modelo || '');
    setMarca(veiculo.marca || '');
    setAno(veiculo.ano ? String(veiculo.ano) : '');
    setCor(veiculo.cor || '');
    setRenavam(veiculo.renavam || '');
    setChassi(veiculo.chassi || '');
    setKmAtual(veiculo.km_atual ? String(veiculo.km_atual) : '');
    setAnoCrlv(veiculo.ano_crlv ? String(veiculo.ano_crlv) : '');
    setStatus(veiculo.status || 'DISPONIVEL');
    setNumeracao(veiculo.numeracao || '');
    setTipoCombustivel(veiculo.tipo_combustivel || 'FLEX');
    setTipoVeiculo(veiculo.tipo_veiculo || 'Carro');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dadosVeiculo = {
      placa,
      modelo,
      marca,
      ano: ano ? Number(ano) : null,
      cor,
      renavam,
      chassi,
      km_atual: kmAtual ? Number(kmAtual) : 0,
      ano_crlv: anoCrlv ? Number(anoCrlv) : null,
      status,
      numeracao,
      tipo_combustivel: tipoCombustivel,
      tipo_veiculo: tipoVeiculo,
    };

    try {
      if (editingId) {
        await updateVeiculo(editingId, dadosVeiculo);
        alert('Veículo atualizado com sucesso!');
      } else {
        await createVeiculo(dadosVeiculo);
        alert('Veículo cadastrado com sucesso!');
      }

      setShowModal(false);
      carregarVeiculos();
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao salvar veículo.';
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

  const getStatusBadge = (statusValue) => {
    const statusMap = {
      DISPONIVEL: 'badge-success',
      MANUTENCAO: 'badge-warning',
      EM_USO: 'badge-info',
      INATIVO: 'badge-danger',
    };
    return statusMap[statusValue] || 'badge-default';
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Veículos
        </h1>
        <button className="btn-primary" onClick={handleOpenModalNovo}>
          <Plus size={18} /> Novo Veículo
        </button>
      </div>

      {/* Tabela de Listagem */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Ano CRLV</th>
              <th>Marca</th>
              <th>Ano</th>
              <th>Cor</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {veiculos.map((v) => {
              const crlvAtrasado = v.ano_crlv && Number(v.ano_crlv) < anoAtual;

              return (
                <tr key={v.id}>
                  <td
                    data-label="Placa"
                    style={{ fontWeight: 'bold', color: '#60a5fa' }}
                  >
                    {v.placa}
                  </td>
                  <td data-label="Modelo">{v.modelo}</td>
                  <td data-label="Tipo">{v.tipo_veiculo || '-'}</td>

                  <td data-label="Status">
                    <span
                      className={`status-badge ${getStatusBadge(v.status)}`}
                    >
                      {v.status || 'DISPONIVEL'}
                    </span>
                  </td>

                  <td data-label="Ano CRLV">
                    <span className={crlvAtrasado ? 'crlv-vencido' : ''}>
                      {v.ano_crlv || '-'}
                    </span>
                  </td>

                  <td data-label="Marca">{v.marca || '-'}</td>
                  <td data-label="Ano">{v.ano || '-'}</td>
                  <td data-label="Cor">{v.cor || '-'}</td>
                  <td data-label="Ações" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(v)}
                        className="btn-icon-primary"
                        title="Editar Veículo"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="btn-icon-danger"
                        title="Excluir Veículo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
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

              <select
                className="input-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="EM_USO">Em Uso</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="INATIVO">Inativo</option>
              </select>

              <input
                className="input-control"
                placeholder="Ano do CRLV (ex: 2026)"
                type="number"
                value={anoCrlv}
                onChange={(e) => setAnoCrlv(e.target.value)}
              />

              <select
                className="input-control"
                value={tipoVeiculo}
                onChange={(e) => setTipoVeiculo(e.target.value)}
              >
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
                <option value="Caminhonete">Caminhonete</option>
                <option value="Caminhão">Caminhão</option>
                <option value="Van">Van</option>
                <option value="Outro">Outro</option>
              </select>

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
              </select>

              <input
                className="input-control"
                placeholder="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
              <input
                className="input-control"
                placeholder="Ano Fab."
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
                placeholder="Numeração (Opcional)"
                value={numeracao}
                onChange={(e) => setNumeracao(e.target.value)}
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
                  {editingId ? 'Atualizar Veículo' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
