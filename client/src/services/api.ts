import axios from 'axios';

const CANDIDATE_PORTS = [5000, 5001, 5002, 5003, 5004, 5005];
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const candidateBaseUrls = [
  configuredApiUrl,
  ...CANDIDATE_PORTS.map((port) => `http://localhost:${port}/api`),
].filter(Boolean) as string[];

let resolvedApiBaseUrl: string | null = null;

async function resolveApiBaseUrl() {
  if (resolvedApiBaseUrl) {
    return resolvedApiBaseUrl;
  }

  for (const baseUrl of candidateBaseUrls) {
    try {
      const healthUrl = `${baseUrl.replace(/\/$/, '')}/health`;
      const response = await fetch(healthUrl, {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        resolvedApiBaseUrl = baseUrl;
        return baseUrl;
      }
    } catch {
      // Ignore and try the next candidate.
    }
  }

  resolvedApiBaseUrl = candidateBaseUrls[0] || 'http://localhost:5000/api';
  return resolvedApiBaseUrl;
}

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const baseUrl = await resolveApiBaseUrl();
  config.baseURL = baseUrl;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('[API Client Error]:', message, error.response?.data);
    return Promise.reject(new Error(message));
  }
);
