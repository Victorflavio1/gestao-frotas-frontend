import api from './api';

export const getMotoristas = async () => {
  const response = await api.get('/api/motoristas');
  return response.data;
};

export const createMotorista = async (dados) => {
  const response = await api.post('/api/motoristas', dados);
  return response.data;
};

export const deleteMotorista = async (id) => {
  const response = await api.delete(`/api/motoristas/${id}`);
  return response.data;
};
