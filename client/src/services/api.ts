import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000') + '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('[API Client Error]:', message, error.response?.data);
    return Promise.reject(new Error(message));
  }
);
