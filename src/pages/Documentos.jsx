import React, { useState, useEffect, useMemo } from 'react';
import {
  getDocumentos,
  createDocumento,
  updateDocumento,
  deleteDocumento,
} from '../services/documentoService';
import { getVeiculos } from '../services/veiculoService';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  FileText,
  X,
  Eye,
  Download,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import autoTable from 'jspdf-autotable';

export default function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Campos do Formulário
  const [veiculoId, setVeiculoId] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('IPVA');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState('PENDENTE');
  const [observacao, setObservacao] = useState('');
  const [arquivoFile, setArquivoFile] = useState(null);

  const carregarDados = async () => {
    try {
      const [dataDocs, dataVeic] = await Promise.all([
        getDocumentos().catch(() => []),
        getVeiculos().catch(() => []),
      ]);
      setDocumentos(dataDocs || []);
      setVeiculos(dataVeic || []);
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleOpenModalNovo = () => {
    setEditingId(null);
    setVeiculoId('');
    setTipoDocumento('IPVA');
    setNumeroDocumento('');
    setDataEmissao('');
    setDataVencimento('');
    setValor('');
    setStatus('PENDENTE');
    setObservacao('');
    setArquivoFile(null);
    setShowModal(true);
  };

  const handleOpenModalEditar = (d) => {
    setEditingId(d.id);
    setVeiculoId(d.veiculo_id || '');
    setTipoDocumento(d.tipo_documento || 'IPVA');
    setNumeroDocumento(d.numero_documento || '');
    setDataEmissao(d.data_emissao ? d.data_emissao.split('T')[0] : '');
    setDataVencimento(d.data_vencimento ? d.data_vencimento.split('T')[0] : '');
    setValor(d.valor || '');
    setStatus(d.status || 'PENDENTE');
    setObservacao(d.observacao || '');
    setArquivoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('veiculo_id', veiculoId);
    formData.append('tipo_documento', tipoDocumento);
    formData.append('numero_documento', numeroDocumento || '');
    formData.append('data_emissao', dataEmissao || '');
    formData.append('data_vencimento', dataVencimento);
    formData.append('valor', valor || 0);
    formData.append('status', status);
    formData.append('observacao', observacao || '');
    if (arquivoFile) {
      formData.append('arquivo', arquivoFile);
    }

    try {
      if (editingId) {
        await updateDocumento(editingId, formData);
        alert('Documento atualizado com sucesso!');
      } else {
        await createDocumento(formData);
        alert('Documento cadastrado com sucesso!');
      }
      setShowModal(false);
      carregarDados();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar documento.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este documento?')) {
      try {
        await deleteDocumento(id);
        carregarDados();
      } catch (err) {
        alert('Erro ao excluir documento.');
      }
    }
  };

  const documentosFiltrados = useMemo(() => {
    return documentos.filter((d) => {
      const termo = busca.toLowerCase();
      const tipo = d.tipo_documento || '';
      const placa = d.veiculo_placa || '';
      const num = d.numero_documento || '';
      return (
        tipo.toLowerCase().includes(termo) ||
        placa.toLowerCase().includes(termo) ||
        num.toLowerCase().includes(termo)
      );
    });
  }, [documentos, busca]);

  const API_URL = 'http://localhost:3000';

  const handleDownloadArquivo = async (urlArquivo) => {
    try {
      const response = await fetch(urlArquivo);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = urlArquivo.split('/').pop() || 'documento';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      alert('Não foi possível baixar o arquivo.');
    }
  };

  // Função para Exportar Excel
  const exportarExcel = () => {
    const dadosParaExportar = documentosFiltrados.map((d) => ({
      Tipo: d.tipo_documento,
      Veículo: `${d.veiculo_placa} (${d.veiculo_modelo})`,
      'Nº Documento': d.numero_documento || '-',
      Vencimento: d.data_vencimento
        ? new Date(d.data_vencimento).toLocaleDateString('pt-BR')
        : '-',
      'Valor (R$)': Number(d.valor || 0),
      Status: d.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documentos');
    XLSX.writeFile(workbook, 'relatorio_documentos_frota.xlsx');
  };

  // Função para Exportar PDF
  /// Função para Exportar PDF corrigida
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Relatório de Documentos e Obrigações da Frota', 14, 20);

      const colunas = [
        'Tipo',
        'Veículo',
        'Nº Documento',
        'Vencimento',
        'Valor',
        'Status',
      ];
      const linhas = documentosFiltrados.map((d) => [
        d.tipo_documento || '-',
        `${d.veiculo_placa || ''} (${d.veiculo_modelo || ''})`,
        d.numero_documento || '-',
        d.data_vencimento
          ? new Date(d.data_vencimento).toLocaleDateString('pt-BR')
          : '-',
        Number(d.valor || 0).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        d.status || '-',
      ]);

      // Chamada correta do autoTable nas versões atuais
      autoTable(doc, {
        head: [colunas],
        body: linhas,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save('relatorio_documentos_frota.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar o arquivo PDF. Verifique o console.');
    }
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
          Controle de Documentos e Obrigações
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
            <FileSpreadsheet size={16} /> Exportar Excel
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
            <FileCode size={16} /> Exportar PDF
          </button>
          <button className="btn-primary" onClick={handleOpenModalNovo}>
            <Plus size={18} /> Novo Documento
          </button>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <div
        style={{
          margin: '16px 0',
          position: 'relative',
          maxWidth: '360px',
        }}
      >
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
          placeholder="Buscar por tipo, placa ou nº documento..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Veículo</th>
              <th>Nº Documento</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Arquivo</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {documentosFiltrados.length > 0 ? (
              documentosFiltrados.map((d) => {
                const vencimentoFormatado = d.data_vencimento
                  ? new Date(d.data_vencimento).toLocaleDateString('pt-BR')
                  : '-';
                const valorFormatado = Number(d.valor || 0).toLocaleString(
                  'pt-BR',
                  {
                    style: 'currency',
                    currency: 'BRL',
                  },
                );

                return (
                  <tr key={d.id}>
                    <td
                      data-label="Tipo"
                      style={{ fontWeight: 'bold', color: '#38bdf8' }}
                    >
                      {d.tipo_documento}
                    </td>
                    <td data-label="Veículo">
                      <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                        {d.veiculo_placa}
                      </span>{' '}
                      ({d.veiculo_modelo})
                    </td>
                    <td data-label="Nº Documento">
                      {d.numero_documento || '-'}
                    </td>
                    <td data-label="Vencimento">{vencimentoFormatado}</td>
                    <td data-label="Valor" style={{ fontWeight: 'bold' }}>
                      {valorFormatado}
                    </td>
                    <td data-label="Status">
                      {d.status === 'PAGO' && (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                          }}
                        >
                          PAGO
                        </span>
                      )}
                      {d.status === 'PENDENTE' && (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: 'rgba(234, 179, 8, 0.2)',
                            color: '#eab308',
                          }}
                        >
                          PENDENTE
                        </span>
                      )}
                      {d.status === 'VENCIDO' && (
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                          }}
                        >
                          VENCIDO
                        </span>
                      )}
                    </td>
                    <td data-label="Arquivo" style={{ textAlign: 'center' }}>
                      {d.arquivo ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            gap: '10px',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <a
                            href={`${API_URL}${d.arquivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Visualizar Documento"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                            }}
                          >
                            <Eye size={16} />
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadArquivo(`${API_URL}${d.arquivo}`)
                            }
                            title="Baixar Documento"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(34, 197, 94, 0.15)',
                              color: '#22c55e',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              cursor: 'pointer',
                            }}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          Sem anexo
                        </span>
                      )}
                    </td>
                    <td data-label="Ações" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenModalEditar(d)}
                          className="btn-icon-secondary"
                          title="Editar Documento"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="btn-icon-danger"
                          title="Excluir Documento"
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
                  colSpan="8"
                  style={{ textAlign: 'center', padding: '24px' }}
                >
                  Nenhum documento registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <FileText size={22} style={{ marginRight: '8px' }} />
                {editingId ? 'Editar Documento' : 'Novo Documento'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Veículo *
                  </label>
                  <select
                    className="input-control"
                    value={veiculoId}
                    onChange={(e) => setVeiculoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o veículo...</option>
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} - {v.modelo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Tipo de Documento *
                  </label>
                  <select
                    className="input-control"
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    required
                  >
                    <option value="IPVA">IPVA</option>
                    <option value="LICENCIAMENTO">Licenciamento Anual</option>
                    <option value="SEGURO">Seguro Obrigatório / Frota</option>
                    <option value="INSPECAO">Inspeção / Vistoria</option>
                    <option value="CRLV">CRLV</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Nº do Documento / Apólice
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: 123456789"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Status *
                  </label>
                  <select
                    className="input-control"
                    value={status}
                    onChange={(e) => (status) => setStatus(e.target.value)}
                    required
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago / Regular</option>
                    <option value="VENCIDO">Vencido</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    className="input-control"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    className="input-control"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-control"
                    placeholder="0.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Anexar Arquivo (PDF / Imagem)
                  </label>
                  <input
                    type="file"
                    className="input-control"
                    accept=".pdf,image/*"
                    onChange={(e) => setArquivoFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Observações
                </label>
                <textarea
                  className="input-control"
                  rows={2}
                  placeholder="Detalhes adicionais..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
