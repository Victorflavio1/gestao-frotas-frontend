import api from './api';

export const getPneus = async () => {
  const response = await api.get('/pneus');
  return response.data;
};

export const createPneu = async (data) => {
  const response = await api.post('/pneus', data);
  return response.data;
};

export const updatePneu = async (id, data) => {
  const response = await api.put(`/pneus/${id}`, data);
  return response.data;
};

export const deletePneu = async (id) => {
  const response = await api.delete(`/pneus/${id}`);
  return response.data;
};
