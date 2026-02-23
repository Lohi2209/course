import axios from 'axios';
import { getAuth } from './authApi';

const API_URL = 'http://localhost:8080/api/dashboard';

const getDashboardInstance = () => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const dashboardInstance = getDashboardInstance();

// Attach JWT token to requests
dashboardInstance.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAdminStats = async () => {
  const response = await dashboardInstance.get('/admin/stats');
  return response.data;
};

export const getFacultyStats = async () => {
  const response = await dashboardInstance.get('/faculty/stats');
  return response.data;
};

export const getAllStudents = async () => {
  try {
    const response = await dashboardInstance.get('/admin/users/students');
    console.log('=== GET STUDENTS SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== GET STUDENTS ERROR ===', error.response?.data);
    throw error;
  }
};

export const getAllFaculty = async () => {
  try {
    const response = await dashboardInstance.get('/admin/users/faculty');
    console.log('=== GET FACULTY SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== GET FACULTY ERROR ===', error.response?.data);
    throw error;
  }
};

export const getAllHOD = async () => {
  try {
    const response = await dashboardInstance.get('/admin/users/hod');
    console.log('=== GET HOD SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== GET HOD ERROR ===', error.response?.data);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await dashboardInstance.get('/admin/users/all');
    console.log('=== GET ALL USERS SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== GET ALL USERS ERROR ===', error.response?.data);
    throw error;
  }
};

export const getStudentStats = async () => {
  const response = await dashboardInstance.get('/student/stats');
  return response.data;
};

export default {
  getAdminStats,
  getFacultyStats,
  getStudentStats,
};
