import api from './api';

export const getDocumentos = async () => {
  const response = await api.get('/api/documentos'); // Se o seu 'api' instance já tiver baseURL com '/api', aqui fica '/documentos'
  return response.data;
};

export const createDocumento = async (formData) => {
  const response = await api.post('/api/documentos', formData);
  return response;
};

// Ou utilizando a própria instância do axios configurada:
export const createDocumentoService = async (formData) => {
  const response = await api.post('/api/documentos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateDocumento = async (id, formData) => {
  const response = await api.put(`/api/documentos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteDocumento = async (id) => {
  const response = await api.delete(`/api/documentos/${id}`);
  return response.data;
};
