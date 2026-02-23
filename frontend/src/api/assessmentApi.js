import axios from 'axios';
import { getAuth } from './authApi';

const API_URL = 'http://localhost:8080/api/assessments';

const getAssessmentInstance = () => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const assessmentInstance = getAssessmentInstance();

// Attach JWT token to requests
assessmentInstance.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    if (config.method === 'post' || config.method === 'put') {
      console.log('=== ASSESSMENT REQUEST ===', config.method.toUpperCase(), config.url, config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

assessmentInstance.interceptors.response.use(
  (response) => {
    if (response.config.method === 'post' || response.config.method === 'put') {
      console.log('=== ASSESSMENT RESPONSE SUCCESS ===', response.status, response.data);
    }
    return response;
  },
  (error) => {
    console.error('=== ASSESSMENT RESPONSE ERROR ===', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const getAssessmentsByCourse = async (courseId) => {
  const response = await assessmentInstance.get(`/course/${courseId}`);
  return response.data;
};

export const createAssessment = async (assessmentData) => {
  const response = await assessmentInstance.post('/', assessmentData);
  return response.data;
};

export const updateAssessment = async (id, assessmentData) => {
  const response = await assessmentInstance.put(`/${id}`, assessmentData);
  return response.data;
};

export const deleteAssessment = async (id) => {
  const response = await assessmentInstance.delete(`/${id}`);
  return response.data;
};

export const addQuestion = async (assessmentId, questionData) => {
  const response = await assessmentInstance.post(`/${assessmentId}/questions`, questionData);
  return response.data;
};

export const getQuestions = async (assessmentId) => {
  const response = await assessmentInstance.get(`/${assessmentId}/questions`);
  return response.data;
};

export const startAssessment = async (assessmentId) => {
  const response = await assessmentInstance.post(`/${assessmentId}/start`);
  return response.data;
};

export const submitAssessment = async (assessmentId, answers) => {
  const response = await assessmentInstance.post(`/${assessmentId}/submit`, answers);
  return response.data;
};

export const getAttempts = async (assessmentId) => {
  const response = await assessmentInstance.get(`/${assessmentId}/attempts`);
  return response.data;
};

export const getAssessmentAttempts = async (assessmentId) => {
  const response = await assessmentInstance.get(`/${assessmentId}/attempts`);
  return response.data;
};

export const getMyAttempts = async () => {
  const response = await assessmentInstance.get('/my-attempts');
  return response.data;
};

export const getMyAssessmentAttempts = async () => {
  const response = await assessmentInstance.get('/my-attempts');
  return response.data;
};

export const getAttemptDetails = async (attemptId) => {
  const response = await assessmentInstance.get(`/attempts/${attemptId}`);
  return response.data;
};

export const gradeAttempt = async (attemptId, gradeData) => {
  const response = await assessmentInstance.put(`/attempts/${attemptId}/grade`, gradeData);
  return response.data;
};

export default {
  getAssessmentsByCourse,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  addQuestion,
  getQuestions,
  startAssessment,
  submitAssessment,
  getAttempts,
  getAssessmentAttempts,
  getMyAttempts,
  getMyAssessmentAttempts,
  getAttemptDetails,
  gradeAttempt,
};
