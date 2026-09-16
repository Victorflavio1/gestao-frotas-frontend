import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckSquare,
  Fuel,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: '#1e293b',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            🚚 Gestão de Frotas
          </h2>
          <nav
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              style={{ ...navBtnStyle, backgroundColor: '#2563eb' }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button onClick={() => navigate('/veiculos')} style={navBtnStyle}>
              <Truck size={18} /> Veículos
            </button>
            <button style={navBtnStyle}>
              <CheckSquare size={18} /> Checklists
            </button>
            <button style={navBtnStyle}>
              <Fuel size={18} /> Abastecimentos
            </button>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          style={{ ...navBtnStyle, backgroundColor: '#ef4444', color: '#fff' }}
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Visão Geral da Frota
        </h1>

        {/* Cards de Métricas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          <Card
            title="Veículos Ativos"
            value="0"
            icon={<Truck color="#3b82f6" />}
          />
          <Card
            title="Checklists Hoje"
            value="0"
            icon={<CheckSquare color="#22c55e" />}
          />
          <Card
            title="Abastecimentos"
            value="0"
            icon={<Fuel color="#eab308" />}
          />
        </div>
      </main>
    </div>
  );
}

const Card = ({ title, value, icon }) => (
  <div
    style={{
      backgroundColor: '#1e293b',
      padding: '20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <div>
      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{title}</p>
      <h3 style={{ fontSize: '24px', margin: '5px 0 0 0' }}>{value}</h3>
    </div>
    {icon}
  </div>
);

const navBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '10px 15px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#334155',
  color: '#f8fafc',
  cursor: 'pointer',
  textAlign: 'left',
};
