import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
let fallbackUrl = isProduction ? '' : 'http://localhost:3002';
const API_URL = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
    : fallbackUrl;

const api = axios.create({
  baseURL: API_URL
});

// Interceptor para adicionar o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-access-token'] = token;
  }
  return config;
});

export default api;
export { API_URL };
