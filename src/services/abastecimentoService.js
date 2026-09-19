import api from './api';

export const getAbastecimentos = async () => {
  const response = await api.get('/api/abastecimentos');
  return response.data;
};

export const createAbastecimento = async (dados) => {
  const response = await api.post('/api/abastecimentos', dados);
  return response.data;
};

export const deleteAbastecimento = async (id) => {
  const response = await api.delete(`/api/abastecimentos/${id}`);
  return response.data;
};
