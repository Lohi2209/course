import axios from 'axios';
import { clearAuth, getAuth } from './authApi';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  if (config.method === 'post' || config.method === 'put') {
    console.log('=== REQUEST ===', config.method.toUpperCase(), config.url, config.data);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'post' || response.config.method === 'put') {
      console.log('=== RESPONSE SUCCESS ===', response.status, response.data);
    }
    return response;
  },
  (error) => {
    console.error('=== RESPONSE ERROR ===', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const createCourse = async (course) => {
  const response = await api.post('/courses', course);
  return response.data;
};

export const updateCourse = async (id, course) => {
  const response = await api.put(`/courses/${id}`, course);
  return response.data;
};

export const deleteCourse = async (id) => {
  await api.delete(`/courses/${id}`);
};

export const getMyEnrolledCourses = async () => {
  const response = await api.get('/student/my-courses');
  return response.data;
};

export default api;
