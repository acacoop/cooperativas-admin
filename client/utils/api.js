import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-url.com' 
  : 'http://localhost:5000';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const cooperativesAPI = {
  getAll: () => api.get('/api/cooperatives'),
  getById: (id) => api.get(`/api/cooperatives/${id}`),
  update: (id, data) => api.put(`/api/cooperatives/${id}`, data),
  getPendingChanges: () => api.get('/api/pending-changes'),
  approveChange: (id) => api.put(`/api/pending-changes/${id}/approve`),
  rejectChange: (id) => api.put(`/api/pending-changes/${id}/reject`)
};

export default api;
