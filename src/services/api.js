import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Ajuste para a porta do seu servidor Node.js
});

// Interceptor para injetar o token de autenticação no cabeçalho das requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Nome da chave onde salvou o token no Login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
