import api from './api';

export const getMultas = async () => {
  const response = await api.get('/api/multas');
  return response.data;
};

export const createMulta = async (data) => {
  const response = await api.post('/api/multas', data);
  return response.data;
};

export const updateMulta = async (id, data) => {
  const response = await api.put(`/api/multas/${id}`, data);
  return response.data;
};

export const deleteMulta = async (id) => {
  const response = await api.delete(`/api/multas/${id}`);
  return response.data;
};
