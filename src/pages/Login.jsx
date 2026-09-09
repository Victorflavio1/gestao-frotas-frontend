import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Faz a requisição POST para a rota de login do backend
      //const response = await api.post('/auth/login', { email, senha });

      const response = await api.post('/api/auth/login', { email, senha });

      // Salva o token JWT e as informações do usuário no localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      // Redireciona o usuário para o Dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensagem) {
        setErro(err.response.data.mensagem);
      } else {
        setErro(
          'Erro ao conectar com o servidor. Verifique se o backend está rodando.',
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '380px',
        }}
      >
        <h2
          style={{ textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}
        >
          🚚 Gestão de Frotas
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '24px',
          }}
        >
          Informe seus dados para acessar o sistema
        </p>

        {erro && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '0.85rem',
              textAlign: 'center',
              border: '1px solid #fecaca',
            }}
          >
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                color: '#334155',
                fontSize: '0.875rem',
                marginBottom: '6px',
                fontWeight: 'bold',
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu.email@empresa.com"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                color: '#334155',
                fontSize: '0.875rem',
                marginBottom: '6px',
                fontWeight: 'bold',
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              backgroundColor: carregando ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              cursor: carregando ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
