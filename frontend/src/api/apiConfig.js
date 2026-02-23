const DEFAULT_API_BASE_URL = 'http://localhost:8080';

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export const API_BASE_URL = configuredBaseUrl;
export const API_ROOT = `${API_BASE_URL}/api`;

export const toAbsoluteUrl = (path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return `${API_BASE_URL}/${normalizedPath}`;
};
