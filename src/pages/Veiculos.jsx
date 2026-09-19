// Importação dos hooks do React para gestão de estado e ciclo de vida
import React, { useState, useEffect } from 'react';

// Importação das funções de requisição à API para o módulo de veículos
import {
  getVeiculos,
  createVeiculo,
  deleteVeiculo,
} from '../services/veiculoService';

// Importação dos ícones do pacote lucide-react para compor a interface visual
import { Trash2, Plus, ArrowLeft } from 'lucide-react';

// Importação do hook do React Router para navegação entre páginas
import { useNavigate } from 'react-router-dom';

export default function Veiculos() {
  // --- ESTADOS (STATES) PARA ARMAZENAR OS DADOS ---
  // Estado que armazena a lista de veículos retornada pelo banco de dados
  const [veiculos, setVeiculos] = useState([]);

  // Estados locais para controlar cada campo individual do formulário
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [renavam, setRenavam] = useState('');
  const [chassi, setChassi] = useState('');
  const [kmAtual, setKmAtual] = useState('');

  // Hook do React Router para navegação programática
  const navigate = useNavigate();

  // --- FUNÇÃO PARA BUSCAR OS VEÍCULOS NA API ---
  const carregarVeiculos = async () => {
    try {
      // Chama a rota GET /api/veiculos
      const data = await getVeiculos();
      // Atualiza o estado da lista com os dados recebidos do servidor
      setVeiculos(data);
    } catch (err) {
      // Extrai e exibe a mensagem de erro retornada pela API
      const msg =
        err.response?.data?.erro || err.response?.data?.mensagem || err.message;
      alert(`Erro ao carregar veículos: ${msg}`);
    }
  };

  // --- CICLO DE VIDA (EFFECT) ---
  // Executa o carregamento inicial da tabela assim que a tela abre
  useEffect(() => {
    carregarVeiculos();
  }, []);

  // --- FUNÇÃO DE SUBMISSÃO DO FORMULÁRIO (CADASTRO) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede que a página recarregue ao enviar o formulário
    try {
      // Envia o objeto com os dados para o endpoint POST /api/veiculos
      await createVeiculo({
        placa,
        modelo,
        marca,
        ano: Number(ano), // Converte a string do input para número
        cor,
        renavam,
        chassi,
        km_atual: Number(kmAtual), // Converte a string do input para número
      });

      alert('Veículo cadastrado com sucesso!');

      // Limpa todos os campos do formulário após o sucesso
      setPlaca('');
      setModelo('');
      setMarca('');
      setAno('');
      setCor('');
      setRenavam('');
      setChassi('');
      setKmAtual('');

      // Recarrega a listagem para exibir o novo veículo inserido
      carregarVeiculos();
    } catch (err) {
      // Exibe a mensagem de erro detalhada vinda do back-end
      const msg =
        err.response?.data?.erro || err.response?.data?.mensagem || err.message;
      alert(`Erro: ${msg}`);
    }
  };

  // --- FUNÇÃO PARA APAGAR UM VEÍCULO ---
  const handleDelete = async (id) => {
    // Pede confirmação ao usuário para evitar exclusões involuntárias
    if (
      confirm(
        'Tem certeza que deseja excluir este veículo? Todos os abastecimentos vinculados também serão excluídos.',
      )
    ) {
      try {
        // Envia a requisição DELETE para /api/veiculos/:id
        await deleteVeiculo(id);
        alert('Veículo removido com sucesso!');
        // Recarrega a tabela após a exclusão
        carregarVeiculos();
      } catch (err) {
        // Exibe o erro retornado no pop-up
        const msg =
          err.response?.data?.erro ||
          err.response?.data?.mensagem ||
          err.message;
        alert(`Erro ao excluir: ${msg}`);
      }
    }
  };

  // --- INTERFACE GRÁFICA (JSX) ---
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
      {/* Botão para retornar à página principal */}
      <button onClick={() => navigate('/dashboard')} style={btnSecondary}>
        <ArrowLeft size={16} /> Voltar ao Dashboard
      </button>

      <h1 style={{ fontSize: '24px', margin: '20px 0' }}>Gestão de Veículos</h1>

      {/* FORMULÁRIO DE CADASTRO COM GRADE RESPONSIVA */}
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
          placeholder="Placa *"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Modelo *"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Ano"
          type="number"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Cor"
          value={cor}
          onChange={(e) => setCor(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Renavam"
          value={renavam}
          onChange={(e) => setRenavam(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Chassi"
          value={chassi}
          onChange={(e) => setChassi(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="KM Atual"
          type="number"
          value={kmAtual}
          onChange={(e) => setKmAtual(e.target.value)}
          style={inputStyle}
        />

        {/* Botão que aciona a submissão do formulário ocupando a largura total */}
        <button type="submit" style={{ ...btnPrimary, gridColumn: '1 / -1' }}>
          <Plus size={16} /> Cadastrar Veículo
        </button>
      </form>

      {/* TABELA COM ROLAGEM HORIZONTAL PARA EXIBIR TODOS OS DADOS */}
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
              <th style={thTdStyle}>Placa</th>
              <th style={thTdStyle}>Modelo</th>
              <th style={thTdStyle}>Marca</th>
              <th style={thTdStyle}>Ano</th>
              <th style={thTdStyle}>Cor</th>
              <th style={thTdStyle}>Renavam</th>
              <th style={thTdStyle}>Chassi</th>
              <th style={thTdStyle}>KM</th>
              <th style={thTdStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderização dinâmica dos veículos mapeados da API */}
            {veiculos.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={thTdStyle}>{v.id}</td>
                <td style={thTdStyle}>{v.placa}</td>
                <td style={thTdStyle}>{v.modelo}</td>
                <td style={thTdStyle}>{v.marca || '-'}</td>
                <td style={thTdStyle}>{v.ano || '-'}</td>
                <td style={thTdStyle}>{v.cor || '-'}</td>
                <td style={thTdStyle}>{v.renavam || '-'}</td>
                <td style={thTdStyle}>{v.chassi || '-'}</td>
                <td style={thTdStyle}>{v.km_atual ?? 0} km</td>
                <td style={thTdStyle}>
                  {/* Botão de exclusão com acionamento do handleDelete passando o ID */}
                  <button
                    onClick={() => handleDelete(v.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
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
    </div>
  );
}

// --- ESTILOS CSS EM JS ---
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
