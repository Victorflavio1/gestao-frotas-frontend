import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login'; // Garanta que o arquivo de Login existe
import Dashboard from './pages/Dashboard';
import Veiculos from './pages/Veiculos';
import Abastecimentos from './pages/Abastecimentos';
import Motoristas from './pages/Motoristas';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

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

        {/* Redirecionamento da raiz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
