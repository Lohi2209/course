import axios from 'axios';
import { API_ROOT } from './apiConfig';

const AUTH_STORAGE_KEY = 'cms_auth';

const authApi = axios.create({
  baseURL: `${API_ROOT}/auth`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
authApi.interceptors.request.use(
  (config) => {
    console.log('=== AUTH REQUEST ===', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('=== AUTH REQUEST ERROR ===', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
authApi.interceptors.response.use(
  (response) => {
    console.log('=== AUTH RESPONSE SUCCESS ===', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('=== AUTH RESPONSE ERROR ===', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const saveAuth = (authData) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  console.log('=== AUTH SAVED ===', authData);
};

export const getAuth = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  console.log('=== AUTH CLEARED ===');
};

export const login = async (payload) => {
  try {
    console.log('=== LOGIN ATTEMPT ===', payload.username);
    const response = await authApi.post('/login', payload);
    console.log('=== LOGIN SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== LOGIN FAILED ===', error.response?.data?.message || error.message);
    throw error;
  }
};

export const register = async (payload) => {
  try {
    console.log('=== REGISTER ATTEMPT ===', payload.username);
    const response = await authApi.post('/register', payload);
    console.log('=== REGISTER SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== REGISTER FAILED ===', error.response?.data?.message || error.message);
    throw error;
  }
};
