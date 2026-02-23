import axios from 'axios';
import { getAuth } from './authApi';

const API_URL = 'http://localhost:8080/api/gradebook';

const getGradebookInstance = () => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const gradebookInstance = getGradebookInstance();

// Attach JWT token to requests
gradebookInstance.interceptors.request.use(
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

export const getMyGrades = async () => {
  const response = await gradebookInstance.get('/student/my-grades');
  return response.data;
};

export const getStudentGradesForCourse = async (courseId, studentId) => {
  const response = await gradebookInstance.get(`/course/${courseId}/student/${studentId}`);
  return response.data;
};

export const getCoursePerformance = async (courseId) => {
  const response = await gradebookInstance.get(`/course/${courseId}/performance`);
  return response.data;
};

export default {
  getMyGrades,
  getStudentGradesForCourse,
  getCoursePerformance,
};
