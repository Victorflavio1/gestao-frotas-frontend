import api from './api';

// CORRETO (sem /api duplicado no início)
export const getVeiculos = async () => {
  const response = await api.get('/api/veiculos');
  return response.data;
};

export const createVeiculo = async (data) => {
  const response = await api.post('/api/veiculos', data);
  return response.data;
};

export const updateVeiculo = async (id, data) => {
  const response = await api.put(`/api/veiculos/${id}`, data);
  return response.data;
};

export const deleteVeiculo = async (id) => {
  const response = await api.delete(`/api/veiculos/${id}`);
  return response.data;
};
