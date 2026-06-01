// client/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:5000/api' // Points directly to your Express backend port
});

// Interceptor to inject your login token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifeos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;