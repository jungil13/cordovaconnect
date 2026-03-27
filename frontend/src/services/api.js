import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cordovaconnect-api.onrender.com/api', // To be environment-driven later
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
