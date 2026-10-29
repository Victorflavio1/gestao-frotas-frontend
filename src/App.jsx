import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login'; // Garanta que o arquivo de Login existe
import Dashboard from './pages/Dashboard';
import Veiculos from './pages/Veiculos';
import Abastecimentos from './pages/Abastecimentos';
import Motoristas from './pages/Motoristas';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Checklists from './pages/Checklists';
import Manutencoes from './pages/Manutencoes';
import Multas from './pages/Multas';
import Pneus from './pages/Pneus';
import Documentos from './pages/Documentos';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />
        {/* Todas as páginas internas usam ProtectedRoute e Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/veiculos"
          element={
            <ProtectedRoute>
              <Layout>
                <Veiculos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/abastecimentos"
          element={
            <ProtectedRoute>
              <Layout>
                <Abastecimentos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/motoristas"
          element={
            <ProtectedRoute>
              <Layout>
                <Motoristas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checklists"
          element={
            <ProtectedRoute>
              <Layout>
                <Checklists />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manutencoes"
          element={
            <ProtectedRoute>
              <Layout>
                <Manutencoes />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pneus"
          element={
            <ProtectedRoute>
              <Layout>
                <Pneus />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/multas"
          element={
            <ProtectedRoute>
              <Layout>
                <Multas />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documentos"
          element={
            <ProtectedRoute>
              <Layout>
                <Documentos />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
