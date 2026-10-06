import React, { useState, useEffect, useMemo } from 'react';
import {
  getMotoristas,
  createMotorista,
  updateMotorista,
  deleteMotorista,
} from '../services/motoristaService';
import {
  Trash2,
  Pencil,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  exportarMotoristasExcel,
  exportarMotoristasPDF,
} from '../utils/exportUtils';

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ESTADOS DE FILTRO
  const [busca, setBusca] = useState('');
  const [filtroStatusCnh, setFiltroStatusCnh] = useState('TODOS');

  // ESTADOS DE PAGINAÇÃO (10 por página)
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnh, setCnh] = useState('');
  const [categoriaCnh, setCategoriaCnh] = useState('B');
  const [vencimentoCnh, setVencimentoCnh] = useState('');

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

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatusCnh]);

  const formatarCPF = (val) => {
    if (!val) return '';
    const apenasNumeros = val.replace(/\D/g, '').slice(0, 11);
    return apenasNumeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = (e) => setCpf(formatarCPF(e.target.value));
  const handleCnhChange = (e) =>
    setCnh(e.target.value.replace(/\D/g, '').slice(0, 11));

  const formatarDataOuAno = (val) => {
    if (!val) return null;
    const str = val.toString().trim();
    if (
      str.includes('1899-11-30') ||
      str.startsWith('0000') ||
      str.startsWith('1899')
    )
      return null;
    if (/^\d{4}$/.test(str)) return str;
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : str;
  };

  const getStatusCnh = (val) => {
    if (!val) return 'normal';
    const str = val.toString().trim();
    if (
      str.includes('1899-11-30') ||
      str.startsWith('0000') ||
      str.startsWith('1899')
    )
      return 'normal';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, ano, mes, dia] = match.map(Number);
      const dataVenc = new Date(ano, mes - 1, dia);
      dataVenc.setHours(0, 0, 0, 0);

      const diferencaDias = Math.ceil(
        (dataVenc - hoje) / (1000 * 60 * 60 * 24),
      );

      if (diferencaDias < 0) return 'vencida';
      if (diferencaDias <= 45) return 'alerta';
      return 'ok';
    }
    return 'normal';
  };

  // FILTRAGEM
  const motoristasFiltrados = useMemo(() => {
    return motoristas.filter((m) => {
      const termo = busca.toLowerCase();
      const combinaTexto =
        (m.nome && m.nome.toLowerCase().includes(termo)) ||
        (m.cpf && m.cpf.includes(termo)) ||
        (m.cnh && m.cnh.includes(termo));

      const statusCnh = getStatusCnh(m.vencimento_cnh);
      let combinaStatus = true;

      if (filtroStatusCnh !== 'TODOS') {
        combinaStatus = statusCnh === filtroStatusCnh;
      }

      return combinaTexto && combinaStatus;
    });
  }, [motoristas, busca, filtroStatusCnh]);

  // PAGINAÇÃO
  const totalPaginas =
    Math.ceil(motoristasFiltrados.length / itensPorPagina) || 1;
  const motoristasPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return motoristasFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [motoristasFiltrados, paginaAtual]);

  const handleOpenModalNovo = () => {
    setEditingId(null);
    setNome('');
    setCpf('');
    setCnh('');
    setCategoriaCnh('B');
    setVencimentoCnh('');
    setShowModal(true);
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setNome(m.nome || '');
    setCpf(m.cpf ? formatarCPF(m.cpf) : '');
    setCnh(m.cnh || '');
    setCategoriaCnh(m.categoria_cnh || 'B');

    let dataFormatted = '';
    if (m.vencimento_cnh) {
      const str = m.vencimento_cnh.toString();
      if (!str.startsWith('1899') && !str.startsWith('0000')) {
        const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
        dataFormatted = match ? match[1] : str.slice(0, 4);
      }
    }
    setVencimentoCnh(dataFormatted);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dados = {
      nome,
      cpf,
      cnh,
      categoria_cnh: categoriaCnh,
      vencimento_cnh: vencimentoCnh || null,
    };

    try {
      if (editingId) {
        await updateMotorista(editingId, dados);
        alert('Motorista atualizado com sucesso!');
      } else {
        await createMotorista(dados);
        alert('Motorista cadastrado com sucesso!');
      }
      setShowModal(false);
      carregarMotoristas();
    } catch (err) {
      alert(`Erro: ${err.response?.data?.erro || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este motorista?')) {
      try {
        await deleteMotorista(id);
        carregarMotoristas();
      } catch (err) {
        alert(`Erro ao excluir: ${err.message}`);
      }
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Motoristas
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary btn-export-excel"
            onClick={() => exportarMotoristasExcel(motoristasFiltrados)}
            title="Exportar Filtrados para Excel"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button
            className="btn-secondary btn-export-pdf"
            onClick={() => exportarMotoristasPDF(motoristasFiltrados)}
            title="Exportar Filtrados para PDF"
          >
            <FileText size={18} /> PDF
          </button>
          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Novo Motorista
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
            placeholder="Buscar por nome, CPF ou CNH..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <select
          className="input-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={filtroStatusCnh}
          onChange={(e) => setFiltroStatusCnh(e.target.value)}
        >
          <option value="TODOS">Todas as CNHs</option>
          <option value="ok">CNH Regular</option>
          <option value="alerta">Vence em 45 Dias</option>
          <option value="vencida">CNH Vencida</option>
        </select>
      </div>

      {/* TABELA DE LISTAGEM */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>CNH</th>
              <th>Cat.</th>
              <th>Vencimento CNH</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {motoristasPaginados.length > 0 ? (
              motoristasPaginados.map((m) => {
                const dataExibicao = formatarDataOuAno(m.vencimento_cnh);
                const status = getStatusCnh(m.vencimento_cnh);

                let badgeStyle = {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                };

                if (status === 'vencida')
                  badgeStyle = {
                    ...badgeStyle,
                    backgroundColor: '#381e28',
                    color: '#ff4d4d',
                  };
                else if (status === 'alerta')
                  badgeStyle = {
                    ...badgeStyle,
                    backgroundColor: '#3a2e1e',
                    color: '#ffb84d',
                  };
                else if (status === 'ok')
                  badgeStyle = {
                    ...badgeStyle,
                    backgroundColor: '#1b3323',
                    color: '#4dff88',
                  };

                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 'bold' }}>{m.nome}</td>
                    <td>{m.cpf || '-'}</td>
                    <td>{m.cnh || '-'}</td>
                    <td>{m.categoria_cnh || '-'}</td>
                    <td>
                      {dataExibicao ? (
                        <span style={badgeStyle}>
                          {status === 'vencida' && (
                            <AlertTriangle
                              size={15}
                              color="#ff4d4d"
                              title="CNH Vencida!"
                            />
                          )}
                          {status === 'alerta' && (
                            <AlertTriangle
                              size={15}
                              color="#ffb84d"
                              title="Vencimento em até 45 dias"
                            />
                          )}
                          {status === 'ok' && (
                            <CheckCircle2
                              size={15}
                              color="#4dff88"
                              title="CNH Regular"
                            />
                          )}
                          {dataExibicao}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(m)}
                          className="btn-icon-primary"
                          title="Editar Motorista"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn-icon-danger"
                          title="Excluir Motorista"
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
                  colSpan="6"
                  style={{ textAlign: 'center', padding: '24px' }}
                >
                  Nenhum motorista encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINAÇÃO */}
      {motoristasFiltrados.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            color: '#94a3b8',
            fontSize: '0.875rem',
          }}
        >
          <span>
            Exibindo {motoristasPaginados.length} de{' '}
            {motoristasFiltrados.length} motoristas
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingId ? 'Editar Motorista' : 'Cadastrar Novo Motorista'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nome Completo <span className="required-star">*</span>
                </label>
                <input
                  className="input-control"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input
                  className="input-control"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Número da CNH</label>
                <input
                  className="input-control"
                  value={cnh}
                  onChange={handleCnhChange}
                  maxLength={11}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria CNH</label>
                <select
                  className="input-control"
                  value={categoriaCnh}
                  onChange={(e) => setCategoriaCnh(e.target.value)}
                >
                  <option value="A">Categoria A</option>
                  <option value="B">Categoria B</option>
                  <option value="C">Categoria C</option>
                  <option value="D">Categoria D</option>
                  <option value="E">Categoria E</option>
                  <option value="AB">Categoria AB</option>
                  <option value="AC">Categoria AC</option>
                  <option value="AD">Categoria AD</option>
                  <option value="AE">Categoria AE</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vencimento da CNH</label>
                <input
                  type="date"
                  className="input-control"
                  value={vencimentoCnh}
                  onChange={(e) => setVencimentoCnh(e.target.value)}
                />
              </div>
              <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Atualizar Motorista' : 'Salvar Motorista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
