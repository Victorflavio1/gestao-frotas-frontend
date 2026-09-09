import axios from 'axios';

// Cria uma instância do Axios configurada com o endereço do seu Back-End
const api = axios.create({
  baseURL: 'http://localhost:3000', // Endereço onde o seu servidor Node.js está rodando
});

// Interceptor para enviar automaticamente o token JWT em requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
