import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck,
  CheckSquare,
  Fuel,
  LogOut,
  LayoutDashboard,
  Users,
  AlertOctagon,
  Wrench,
  Disc,
  FileText,
} from 'lucide-react';
import './Layout.css'; // Importação das regras de CSS e Responsividade

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getBtnClass = (path) => {
    return location.pathname === path ? 'active-btn' : '';
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="layout-sidebar">
        <div>
          <h2 className="sidebar-title">🚚 Gestão de Frotas</h2>
          <nav className="sidebar-nav">
            <button
              onClick={() => navigate('/dashboard')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/dashboard' ? '#2563eb' : '#334155',
              }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button
              onClick={() => navigate('/veiculos')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/veiculos' ? '#2563eb' : '#334155',
              }}
            >
              <Truck size={18} /> Veículos
            </button>

            <button
              onClick={() => navigate('/checklists')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/checklists' ? '#2563eb' : '#334155',
              }}
            >
              <CheckSquare size={18} /> Checklists
            </button>

            <button
              onClick={() => navigate('/abastecimentos')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/abastecimentos'
                    ? '#2563eb'
                    : '#334155',
              }}
            >
              <Fuel size={18} /> Abastecimentos
            </button>

            <button
              onClick={() => navigate('/motoristas')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/motoristas' ? '#2563eb' : '#334155',
              }}
            >
              <Users size={18} /> Motoristas
            </button>

            <button
              onClick={() => navigate('/manutencoes')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/manutencoes' ? '#2563eb' : '#334155',
              }}
            >
              <Wrench size={18} /> Manutenções
            </button>

            <button
              onClick={() => navigate('/pneus')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/pneus' ? '#2563eb' : '#334155',
              }}
            >
              <Disc size={18} /> Pneus
            </button>

            <button
              onClick={() => navigate('/multas')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/multas' ? '#2563eb' : '#334155',
              }}
            >
              <AlertOctagon size={18} /> Multas
            </button>

            <button
              onClick={() => navigate('/documentos')}
              className="nav-btn"
              style={{
                backgroundColor:
                  location.pathname === '/documentos' ? '#2563eb' : '#334155',
              }}
            >
              <FileText size={18} /> Documentos
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="nav-btn"
          style={{ backgroundColor: '#ef4444' }}
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Conteúdo Renderizado */}
      <main className="layout-content">{children}</main>
    </div>
  );
}
