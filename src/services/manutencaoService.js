import api from './api';

export const getManutencoes = async () => {
  const response = await api.get('/api/manutencoes');
  return response.data;
};

export const createManutencao = async (data) => {
  const response = await api.post('api/manutencoes', data);
  return response.data;
};

export const updateManutencao = async (id, data) => {
  const response = await api.put(`/api/manutencoes/${id}`, data);
  return response.data;
};

export const deleteManutencao = async (id) => {
  const response = await api.delete(`/api/manutencoes/${id}`);
  return response.data;
};
