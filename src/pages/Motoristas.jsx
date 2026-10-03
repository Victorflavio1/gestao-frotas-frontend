import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  // --- FUNÇÕES DE FORMATAÇÃO E MÁSCARAS ---
  const formatarCPF = (val) => {
    if (!val) return '';
    const apenasNumeros = val.replace(/\D/g, '').slice(0, 11);
    return apenasNumeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = (e) => {
    setCpf(formatarCPF(e.target.value));
  };

  const handleCnhChange = (e) => {
    const apenasNumeros = e.target.value.replace(/\D/g, '').slice(0, 11);
    setCnh(apenasNumeros);
  };

  const formatarDataOuAno = (val) => {
    if (!val) return null;

    const str = val.toString().trim();

    if (
      str.includes('1899-11-30') ||
      str.startsWith('0000') ||
      str.startsWith('1899')
    ) {
      return null;
    }

    if (/^\d{4}$/.test(str)) {
      return str;
    }

    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, ano, mes, dia] = match;
      return `${dia}/${mes}/${ano}`;
    }

    return str;
  };

  // --- LÓGICA DE VERIFICAÇÃO DO STATUS DA CNH ---
  const getStatusCnh = (val) => {
    if (!val) return 'normal';

    const str = val.toString().trim();
    if (
      str.includes('1899-11-30') ||
      str.startsWith('0000') ||
      str.startsWith('1899')
    ) {
      return 'normal';
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, ano, mes, dia] = match.map(Number);
      const dataVenc = new Date(ano, mes - 1, dia);
      dataVenc.setHours(0, 0, 0, 0);

      const diferencaTempo = dataVenc - hoje;
      const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

      // 🔴 Vermelho: Vencimento já passou (< 0 dias)
      if (diferencaDias < 0) return 'vencida';

      // 🟡 Amarelo: Vence hoje ou em até 45 dias (0 a 45 dias)
      if (diferencaDias <= 45) return 'alerta';

      // 🟢 Verde: Mais de 45 dias para vencer (>= 46 dias)
      return 'ok';
    }

    return 'normal';
  };

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

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      alert('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    if (cnh.length > 0 && cnh.length !== 11) {
      alert('A CNH deve conter exatamente 11 dígitos.');
      return;
    }

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
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>
          Gestão de Motoristas
        </h1>
        <button className="btn-primary" onClick={handleOpenModalNovo}>
          <Plus size={18} /> Novo Motorista
        </button>
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
            {motoristas.map((m) => {
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

              if (status === 'vencida') {
                badgeStyle = {
                  ...badgeStyle,
                  backgroundColor: '#381e28', // Fundo escuro avermelhado
                  color: '#ff4d4d', // Texto e ícone vermelhos
                };
              } else if (status === 'alerta') {
                badgeStyle = {
                  ...badgeStyle,
                  backgroundColor: '#3a2e1e', // Fundo escuro amarelado
                  color: '#ffb84d', // Texto e ícone amarelos
                };
              } else if (status === 'ok') {
                badgeStyle = {
                  ...badgeStyle,
                  backgroundColor: '#1b3323', // Fundo escuro esverdeado
                  color: '#4dff88', // Texto e ícone verdes
                };
              } else {
                badgeStyle = {
                  ...badgeStyle,
                  backgroundColor: 'transparent',
                  color: 'inherit',
                };
              }

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
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
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
              {/* Campo Nome Completo */}
              <div className="form-group">
                <label className="form-label">
                  Nome Completo <span className="required-star">*</span>
                </label>
                <input
                  className="input-control"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              {/* Campo CPF */}
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input
                  className="input-control"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                />
              </div>

              {/* Campo CNH */}
              <div className="form-group">
                <label className="form-label">Número da CNH</label>
                <input
                  className="input-control"
                  placeholder="Apenas números (11 dígitos)"
                  value={cnh}
                  onChange={handleCnhChange}
                  maxLength={11}
                />
              </div>

              {/* Campo Categoria CNH */}
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

              {/* Campo Vencimento da CNH */}
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
