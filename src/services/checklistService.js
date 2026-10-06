import api from './api';

export const getChecklists = async () => {
  const response = await api.get('/api/checklists');
  return response.data;
};

export const createChecklist = async (dados) => {
  const response = await api.post('/api/checklists', dados);
  return response.data;
};

export const deleteChecklist = async (id) => {
  const response = await api.delete(`/api/checklists/${id}`);
  return response.data;
};
