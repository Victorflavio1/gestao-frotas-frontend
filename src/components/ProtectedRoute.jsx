import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // Se não existir token, redireciona para a tela de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
