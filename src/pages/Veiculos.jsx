import React, { useState, useEffect, useMemo } from 'react';
import {
  getVeiculos,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
} from '../services/veiculoService';
import {
  Trash2,
  Pencil,
  Plus,
  X,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  exportarVeiculosExcel,
  exportarVeiculosPDF,
} from '../utils/exportUtils';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ESTADOS DE FILTRO
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  // ESTADOS DE PAGINAÇÃO (10 por página)
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

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

  // Resetar página ao alterar filtros
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus]);

  // LÓGICA DE FILTRAGEM
  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter((v) => {
      const termo = busca.toLowerCase();
      const combinaTexto =
        (v.placa && v.placa.toLowerCase().includes(termo)) ||
        (v.modelo && v.modelo.toLowerCase().includes(termo)) ||
        (v.marca && v.marca.toLowerCase().includes(termo));

      const st = (v.status || 'DISPONIVEL').toUpperCase();
      let combinaStatus = true;

      if (filtroStatus !== 'TODOS') {
        combinaStatus = st.includes(filtroStatus);
      }

      return combinaTexto && combinaStatus;
    });
  }, [veiculos, busca, filtroStatus]);

  // LÓGICA DE PAGINAÇÃO (Fatia os 10 itens da página atual)
  const totalPaginas =
    Math.ceil(veiculosFiltrados.length / itensPorPagina) || 1;
  const veiculosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return veiculosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [veiculosFiltrados, paginaAtual]);

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

    const st = (veiculo.status || 'DISPONIVEL').toString().toUpperCase();
    if (st.includes('MANUTEN')) setStatus('MANUTENCAO');
    else if (st.includes('INATIV') || st.includes('DESATIV'))
      setStatus('INATIVO');
    else if (st.includes('USO') || st.includes('OCUP')) setStatus('EM_USO');
    else setStatus('DISPONIVEL');

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
      alert(err.response?.data?.erro || 'Erro ao salvar veículo.');
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

  const renderStatusBadge = (statusValue) => {
    const val = statusValue
      ? statusValue.toString().trim().toUpperCase()
      : 'DISPONIVEL';

    if (val.includes('USO') || val.includes('OCUP')) {
      return <span className="status-badge status-em-uso">EM USO</span>;
    }
    if (val.includes('MANUTEN')) {
      return <span className="status-badge status-manutencao">MANUTENÇÃO</span>;
    }
    if (val.includes('INATIV') || val.includes('DESATIV')) {
      return <span className="status-badge status-inativo">INATIVO</span>;
    }

    return <span className="status-badge status-disponivel">DISPONÍVEL</span>;
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Veículos
        </h1>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Exporta apenas os veículos filtrados */}
          <button
            className="btn-secondary btn-export-excel"
            onClick={() => exportarVeiculosExcel(veiculosFiltrados)}
            title="Exportar Filtrados para Excel"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>

          <button
            className="btn-secondary btn-export-pdf"
            onClick={() => exportarVeiculosPDF(veiculosFiltrados)}
            title="Exportar Filtrados para PDF"
          >
            <FileText size={18} /> PDF
          </button>

          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Novo Veículo
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
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
            placeholder="Buscar por placa, modelo ou marca..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <select
          className="input-control"
          style={{ width: 'auto', minWidth: '160px' }}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="TODOS">Todos os Status</option>
          <option value="DISPONIVEL">Disponível</option>
          <option value="USO">Em Uso</option>
          <option value="MANUTEN">Manutenção</option>
          <option value="INATIV">Inativo</option>
        </select>
      </div>

      {/* TABELA DE LISTAGEM */}
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
            {veiculosPaginados.length > 0 ? (
              veiculosPaginados.map((v) => {
                const crlvAtrasado =
                  v.ano_crlv && Number(v.ano_crlv) < anoAtual;

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
                    <td data-label="Status">{renderStatusBadge(v.status)}</td>
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
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: 'center', padding: '24px' }}
                >
                  Nenhum veículo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINAÇÃO (Aparecem se houver registros) */}
      {veiculosFiltrados.length > 0 && (
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            color: '#94a3b8',
            fontSize: '0.875rem',
          }}
        >
          <span>
            Exibindo {veiculosPaginados.length} de {veiculosFiltrados.length}{' '}
            veículos
          </span>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
              style={{
                padding: '6px 12px',
                opacity: paginaAtual === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              className="btn-secondary"
              disabled={paginaAtual === totalPaginas}
              onClick={() =>
                setPaginaAtual((p) => Math.min(p + 1, totalPaginas))
              }
              style={{
                padding: '6px 12px',
                opacity: paginaAtual === totalPaginas ? 0.5 : 1,
              }}
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
