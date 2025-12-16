import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://executive-cent-reliability-eva.trycloudflare.com';
const LOCATION_API_URL = import.meta.env.VITE_LOCATION_API_URL || 'https://pacific-fighter-missile-stuffed.trycloudflare.com';
const NOTIFICATION_API_URL = import.meta.env.VITE_NOTIFICATION_API_URL || 'https://needs-psi-peak-discharge.trycloudflare.com';
const QR_API_URL = import.meta.env.VITE_QR_API_URL || 'https://qr-service-tunnel.trycloudflare.com';
const FILE_API_URL = import.meta.env.VITE_FILE_API_URL || 'https://file-service-tunnel.trycloudflare.com';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth-service-tunnel.trycloudflare.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const locationAPI = axios.create({
  baseURL: LOCATION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notificationAPI = axios.create({
  baseURL: NOTIFICATION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const qrAPI = axios.create({
  baseURL: QR_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fileAPI = axios.create({
  baseURL: FILE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authServiceAPI = axios.create({
  baseURL: AUTH_API_URL,
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

// Location Service API
export const locationServiceAPI = {
  getCurrentLocation: (petId: string) => api.get(`/pets/${petId}/location`),
  getLocationHistory: (petId: string) => api.get(`/pets/${petId}/location/history`),
  // Direct location service API
  getCurrentLocationByCollar: (collarId: string) => locationAPI.get(`/location/collar/${collarId}/current`),
  getLocationHistoryByCollar: (collarId: string) => locationAPI.get(`/location/collar/${collarId}/history`),
};

// Notifications API (via proxy)
export const notificationsAPI = {
  getMyNotifications: () => api.get('/pets/my-notifications'),
  getUnreadCount: () => api.get('/pets/my-notifications/unread-count'),
};

// QR Service API
export const qrServiceAPI = {
  registerQR: (petData: { petName: string; ownerName: string; phone: string }) =>
    qrAPI.post('/qr/register', petData),
  listQRs: () => qrAPI.get('/qr/list'),
  getQRInfo: (qrCode: string) => qrAPI.get(`/found/${qrCode}`),
};

// File Service API
export const fileServiceAPI = {
  uploadFile: (formData: FormData) =>
    fileAPI.post('/api/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUserFiles: (userId: string) => fileAPI.get(`/api/v1/files/user/${userId}`),
  getFile: (fileId: string) => fileAPI.get(`/api/v1/files/${fileId}`),
  downloadFile: (fileId: string) => fileAPI.get(`/api/v1/files/${fileId}/download`),
  deleteFile: (fileId: string) => fileAPI.delete(`/api/v1/files/${fileId}`),
};