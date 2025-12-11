import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Pets API
export const petsAPI = {
  getMyPets: () => api.get('/pets'),
  createPet: (petData: any) => api.post('/pets', petData),
  getPet: (id: string) => api.get(`/pets/${id}`),
  updatePet: (id: string, data: any) => api.put(`/pets/${id}`, data),
};

// Sensor Data API
export const sensorAPI = {
  getPetData: (petId: string, limit?: number) =>
    api.get(`/sensor-data/pet/${petId}${limit ? `?limit=${limit}` : ''}`),
  getLatestData: (petId: string) => api.get(`/sensor-data/pet/${petId}/latest`),
  getStats: (petId: string, hours?: number) =>
    api.get(`/sensor-data/pet/${petId}/stats${hours ? `?hours=${hours}` : ''}`),
};