import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Artifact {
  id: number;
  title: string;
  description: string;
  category: string;
  year?: string;
  creator?: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export const artifactAPI = {
  getAll: () => api.get<Artifact[]>('/artifacts'),
  getById: (id: number) => api.get<Artifact>(`/artifacts/${id}`),
  create: (formData: FormData) => api.post('/artifacts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: number, formData: FormData) => api.put(`/artifacts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: number) => api.delete(`/artifacts/${id}`),
};

export const authAPI = {
  login: (username: string, password: string) => 
    api.post('/admin/login', { username, password }),
};

export const categoryAPI = {
  getAll: () => api.get<string[]>('/categories'),
};

export default api;