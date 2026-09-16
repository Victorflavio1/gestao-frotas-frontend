import api from './api';

export const getVeiculos = async () => {
  const response = await api.get('/api/veiculos');
  return response.data;
};

export const createVeiculo = async (veiculoData) => {
  const response = await api.post('/api/veiculos', veiculoData);
  return response.data;
};

export const deleteVeiculo = async (id) => {
  const response = await api.delete(`/api/veiculos/${id}`);
  return response.data;
};
