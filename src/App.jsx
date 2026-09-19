import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login'; // Garanta que o arquivo de Login existe
import Dashboard from './pages/Dashboard';
import Veiculos from './pages/Veiculos';
import Abastecimentos from './pages/Abastecimentos';
import Motoristas from './pages/Motoristas';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/veiculos"
          element={
            <ProtectedRoute>
              <Veiculos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/abastecimentos"
          element={
            <ProtectedRoute>
              <Abastecimentos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/motoristas"
          element={
            <ProtectedRoute>
              <Motoristas />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento da raiz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
