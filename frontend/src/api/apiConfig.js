const LOCAL_API_BASE_URL = 'http://localhost:8080';
const DEPLOYED_API_BASE_URL = 'https://course-management-system-70pg.onrender.com';

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const isLocalFrontendHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const defaultBaseUrl = isLocalFrontendHost ? LOCAL_API_BASE_URL : DEPLOYED_API_BASE_URL;
const configuredBaseUrl = (envBaseUrl || defaultBaseUrl).replace(/\/$/, '');
const normalizedApiRoot = configuredBaseUrl.endsWith('/api')
  ? configuredBaseUrl
  : `${configuredBaseUrl}/api`;
const normalizedBaseUrl = normalizedApiRoot.replace(/\/api$/, '');

export const API_BASE_URL = normalizedBaseUrl;
export const API_ROOT = normalizedApiRoot;

export const toAbsoluteUrl = (path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return `${API_BASE_URL}/${normalizedPath}`;
};
