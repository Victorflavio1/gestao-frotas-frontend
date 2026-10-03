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

// ✅ CORRIGIDO: Adicionado /api/ no início da URL
export const updateAbastecimento = async (id, dados) => {
  const response = await api.put(`/api/abastecimentos/${id}`, dados);
  return response.data;
};
