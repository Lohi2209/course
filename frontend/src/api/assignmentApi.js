import axios from 'axios';
import { getAuth } from './authApi';

const API_URL = 'http://localhost:8080/api/assignments';

const getAssignmentInstance = () => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const assignmentInstance = getAssignmentInstance();

// Attach JWT token to requests
assignmentInstance.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    if (config.method === 'post' || config.method === 'put') {
      console.log('=== ASSIGNMENT REQUEST ===', config.method.toUpperCase(), config.url, config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

assignmentInstance.interceptors.response.use(
  (response) => {
    if (response.config.method === 'post' || response.config.method === 'put') {
      console.log('=== ASSIGNMENT RESPONSE SUCCESS ===', response.status, response.data);
    }
    return response;
  },
  (error) => {
    console.error('=== ASSIGNMENT RESPONSE ERROR ===', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const getAssignmentsByCourse = async (courseId) => {
  const response = await assignmentInstance.get(`/course/${courseId}`);
  return response.data;
};

export const createAssignment = async (assignmentData) => {
  const response = await assignmentInstance.post('', assignmentData);
  return response.data;
};

export const updateAssignment = async (id, assignmentData) => {
  const response = await assignmentInstance.put(`/${id}`, assignmentData);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await assignmentInstance.delete(`/${id}`);
  return response.data;
};

export const submitAssignment = async (assignmentId, submissionData) => {
  const response = await assignmentInstance.post(`/${assignmentId}/submit`, submissionData);
  return response.data;
};

export const getSubmissions = async (assignmentId) => {
  const response = await assignmentInstance.get(`/${assignmentId}/submissions`);
  return response.data;
};

export const getMySubmissions = async () => {
  const response = await assignmentInstance.get('/my-submissions');
  return response.data;
};

export const gradeSubmission = async (submissionId, gradeData) => {
  const response = await assignmentInstance.put(`/submissions/${submissionId}/grade`, gradeData);
  return response.data;
};

export default {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  getMySubmissions,
  gradeSubmission,
};
