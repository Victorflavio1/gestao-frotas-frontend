import React, { useState, useEffect, useMemo } from 'react';
import {
  getPneus,
  createPneu,
  updatePneu,
  deletePneu,
} from '../services/pneuService';
import { getVeiculos } from '../services/veiculoService';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Disc,
  X,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Pneus() {
  const [pneus, setPneus] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroMedida, setFiltroMedida] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Campos do Formulário
  const [identificadorPreview, setIdentificadorPreview] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [marca, setMarca] = useState('');
  const [medida, setMedida] = useState('');
  const [estadoGeral, setEstadoGeral] = useState('Novo');
  const [status, setStatus] = useState('Estoque');
  const [valorAquisicao, setValorAquisicao] = useState('');
  const [kmInstalacao, setKmInstalacao] = useState('');
  const [dataCadastro, setDataCadastro] = useState('');

  const carregarDados = async () => {
    try {
      const dataPneus = await getPneus().catch(() => []);
      setPneus(dataPneus || []);

      const todosVeiculos = await getVeiculos().catch(() => []);
      const veiculosFiltrados = todosVeiculos.filter((v) => {
        const st = (v.status || '').toLowerCase().trim();
        return (
          st.includes('ativ') || st.includes('uso') || st.includes('manut')
        );
      });
      setVeiculos(veiculosFiltrados);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const gerarProximoIdentificador = (listaPneus) => {
    const proximoNum = listaPneus.length + 1;
    return `PNEU-${String(proximoNum).padStart(4, '0')}`;
  };

  const handleOpenModalNovo = () => {
    setEditingId(null);
    setIdentificadorPreview(gerarProximoIdentificador(pneus));
    setVeiculoId('');
    setMarca('');
    setMedida('');
    setEstadoGeral('Novo');
    setStatus('Estoque');
    setValorAquisicao('');
    setKmInstalacao('0');
    setDataCadastro(new Date().toISOString().split('T')[0]); // Data atual pré-preenchida
    setShowModal(true);
  };

  const handleOpenModalEditar = (p) => {
    setEditingId(p.id);
    setIdentificadorPreview(p.identificador);
    setVeiculoId(p.veiculo_id || '');
    setMarca(p.marca || '');
    setMedida(p.medida || '');
    setEstadoGeral(p.estado_geral || 'Novo');
    setStatus(p.status || 'Estoque'); // Carrega o status atual gravado no banco
    setValorAquisicao(p.valor_aquisicao || '');
    setKmInstalacao(p.km_instalacao || '');
    setDataCadastro(
      p.data_cadastro
        ? p.data_cadastro.split('T')[0]
        : new Date().toISOString().split('T')[0],
    );
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      identificador: identificadorPreview,
      veiculo_id: veiculoId || null,
      marca,
      medida,
      estado_geral: estadoGeral,
      status: status, // Utiliza diretamente o status escolhido no formulário
      valor_aquisicao: Number(valorAquisicao) || 0,
      km_instalacao: Number(kmInstalacao) || 0,
      data_cadastro: dataCadastro,
    };

    try {
      if (editingId) {
        await updatePneu(editingId, payload);
        alert('Pneu atualizado com sucesso!');
      } else {
        await createPneu(payload);
        alert(`Pneu ${identificadorPreview} cadastrado com sucesso!`);
      }
      setShowModal(false);
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar pneu.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este pneu?')) {
      try {
        await deletePneu(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir pneu.');
      }
    }
  };

  const pneusFiltrados = useMemo(() => {
    return pneus.filter((p) => {
      const termo = filtroBusca.toLowerCase();
      const ident = p.identificador ? p.identificador.toLowerCase() : '';
      const placa = p.veiculo_placa ? p.veiculo_placa.toLowerCase() : '';

      const matchBusca = ident.includes(termo) || placa.includes(termo);
      const matchMarca = filtroMarca ? p.marca === filtroMarca : true;
      const matchMedida = filtroMedida ? p.medida === filtroMedida : true;
      const matchStatus = filtroStatus ? p.status === filtroStatus : true;
      const matchEstado = filtroEstado ? p.estado_geral === filtroEstado : true;

      return (
        matchBusca && matchMarca && matchMedida && matchStatus && matchEstado
      );
    });
  }, [
    pneus,
    filtroBusca,
    filtroMarca,
    filtroMedida,
    filtroStatus,
    filtroEstado,
  ]);

  const exportarExcel = () => {
    const dados = pneusFiltrados.map((p) => ({
      Identificador: p.identificador,
      Marca: p.marca,
      Medida: p.medida,
      'Tipo de Vida': p.estado_geral, // Incluído tipo_vida na planilha
      Status: p.status,
      'Veículo Vinculado': p.veiculo_placa
        ? `${p.veiculo_placa} (${p.veiculo_modelo})`
        : 'Em Estoque',
      'Km Instalação': p.km_instalacao,
      'Data Cadastro': p.data_cadastro ? p.data_cadastro.split('T')[0] : '',
      'Valor (R$)': Number(p.valor_aquisicao || 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pneus');
    XLSX.writeFile(workbook, 'relatorio_pneus_frota.xlsx');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Controle de Pneus da Frota', 14, 20);

    // Colunas separando Marca e Medida, e incluindo Tipo de Vida
    const colunas = [
      'Identificador',
      'Marca',
      'Medida',
      'Tipo Vida',
      'Status',
      'Veículo',
      'Km Inst.',
      'Data',
    ];
    const linhas = pneusFiltrados.map((p) => [
      p.identificador,
      p.marca, // Marca isolada
      p.medida, // Medida isolada
      p.estado_geral, // Tipo de vida
      p.status,
      p.veiculo_placa ? `${p.veiculo_placa}` : 'Estoque',
      p.km_instalacao,
      p.data_cadastro ? p.data_cadastro.split('T')[0] : '',
    ]);

    autoTable(doc, {
      head: [colunas],
      body: linhas,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 7.5 }, // Ajustado para caber todas as colunas com folga
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('relatorio_pneus_frota.pdf');
  };

  return (
    <>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1 className="page-title" style={{ margin: 0 }}>
          Controle e Gestão de Pneus
        </h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={exportarExcel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button
            className="btn-secondary"
            onClick={exportarPDF}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <FileCode size={16} /> PDF
          </button>
          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Novo Pneu
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          margin: '16px 0',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
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
            style={{ paddingLeft: '36px' }}
            placeholder="Buscar Identificador ou Placa..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
          />
        </div>

        <select
          className="input-control"
          value={filtroMarca}
          onChange={(e) => setFiltroMarca(e.target.value)}
        >
          <option value="">Todas as Marcas</option>
          {[...new Set(pneus.map((p) => p.marca))].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          className="input-control"
          value={filtroMedida}
          onChange={(e) => setFiltroMedida(e.target.value)}
        >
          <option value="">Todas as Medidas</option>
          {[...new Set(pneus.map((p) => p.medida))].map((med) => (
            <option key={med} value={med}>
              {med}
            </option>
          ))}
        </select>

        <select
          className="input-control"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="Estoque">Estoque</option>
          <option value="Em Uso">Em Uso</option>
          <option value="Reformando">Reformando</option>
          <option value="Descartado">Descartado</option>
        </select>

        <select
          className="input-control"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos os Estados</option>
          <option value="Novo">Novo</option>
          <option value="Meia-Vida">Meia-Vida</option>
          <option value="Recapado">Recapado</option>
          <option value="Desgastado">Desgastado</option>
        </select>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Marca / Medida</th>
              <th>Estado Geral</th>
              <th>Status</th>
              <th>Veículo Vinculado</th>
              <th>Km Inst.</th>
              <th>Data Cadastro</th>
              <th>Valor (R$)</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pneusFiltrados.length > 0 ? (
              pneusFiltrados.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 'bold', color: '#38bdf8' }}>
                    {p.identificador}
                  </td>
                  <td>
                    {p.marca}{' '}
                    <span style={{ color: '#94a3b8' }}>({p.medida})</span>
                  </td>
                  <td>{p.estado_geral}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor:
                          p.status === 'Em Uso'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(234, 179, 8, 0.2)',
                        color: p.status === 'Em Uso' ? '#22c55e' : '#eab308',
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.veiculo_placa ? (
                      <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                        {p.veiculo_placa} ({p.veiculo_modelo})
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Em Estoque</span>
                    )}
                  </td>
                  <td>{p.km_instalacao} km</td>
                  <td>
                    {p.data_cadastro
                      ? new Date(p.data_cadastro).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>
                    {Number(p.valor_aquisicao || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: '8px',
                        justifyContent: 'center',
                      }}
                    >
                      <button
                        onClick={() => handleOpenModalEditar(p)}
                        className="btn-icon-secondary"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-icon-danger"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: '#94a3b8',
                  }}
                >
                  Nenhum pneu registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Disc size={20} style={{ marginRight: '8px' }} />
                {editingId ? 'Editar Pneu' : 'Novo Pneu'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    color: '#38bdf8',
                    fontWeight: 'bold',
                  }}
                >
                  Identificador (PNEU-XXXX)
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={identificadorPreview}
                  disabled
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    fontWeight: 'bold',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Veículo Vinculado
                </label>
                <select
                  className="input-control"
                  value={veiculoId}
                  onChange={(e) => setVeiculoId(e.target.value)}
                >
                  <option value="">Nenhum (Manter em Estoque)</option>
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Marca *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: Michelin"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Medida *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: 295/80 R22.5"
                    value={medida}
                    onChange={(e) => setMedida(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
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
                    <option value="Estoque">Estoque</option>
                    <option value="Em Uso">Em Uso</option>
                    <option value="Reformando">Reformando</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Estado Geral *
                  </label>
                  <select
                    className="input-control"
                    value={estadoGeral}
                    onChange={(e) => setEstadoGeral(e.target.value)}
                    required
                  >
                    <option value="Novo">Novo</option>
                    <option value="Meia-Vida">Meia-Vida</option>
                    <option value="Recapado">Recapado</option>
                    <option value="Desgastado">Desgastado</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Km de Instalação
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    placeholder="0"
                    value={kmInstalacao}
                    onChange={(e) => setKmInstalacao(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Valor de Aquisição (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="0.00"
                    value={valorAquisicao}
                    onChange={(e) => setValorAquisicao(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Data de Cadastro
                </label>
                <input
                  type="date"
                  className="input-control"
                  value={dataCadastro}
                  onChange={(e) => setDataCadastro(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Pneu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
