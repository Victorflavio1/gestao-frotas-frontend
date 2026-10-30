import api from './api'; // ou a sua instância do axios configurada

export const getPneus = async () => {
  const response = await api.get('/api/pneus');
  return response.data;
};

export const createPneu = async (data) => {
  const response = await api.post('/api/pneus', data);
  return response.data;
};

export const updatePneu = async (id, data) => {
  const response = await api.put(`/api/pneus/${id}`, data);
  return response.data;
};

export const deletePneu = async (id) => {
  const response = await api.delete(`/api/pneus/${id}`);
  return response.data;
};

// ADICIONE ESTA FUNÇÃO QUE ESTÁ EM FALTA:
export const getVeiculosElegiveis = async () => {
  const response = await api.get('/api/pneus/veiculos-elegiveis'); // ou a rota correta para buscar veículos no seu backend
  return response.data;
};
