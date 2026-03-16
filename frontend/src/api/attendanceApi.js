import axios from 'axios';
import { getAuth } from './authApi';
import { API_ROOT } from './apiConfig';

const attendanceApi = axios.create({
  baseURL: `${API_ROOT}/attendance`,
  headers: {
    'Content-Type': 'application/json',
  },
});

attendanceApi.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export const markAttendance = async (payload) => {
  const response = await attendanceApi.post('/mark', payload);
  return response.data;
};

export const getCourseAttendanceByDate = async (courseId, attendanceDate) => {
  const response = await attendanceApi.get(`/course/${courseId}`, {
    params: { attendanceDate },
  });
  return response.data;
};

export const getMyAttendanceRecords = async () => {
  const response = await attendanceApi.get('/student/my-records');
  return response.data;
};

export const getMyAttendanceSummary = async () => {
  const response = await attendanceApi.get('/student/my-summary');
  return response.data;
};

export const downloadAttendanceReport = async (courseId, month, format = 'csv') => {
  const response = await attendanceApi.get('/export', {
    params: { courseId, month, format },
    responseType: 'blob',
  });
  return response.data;
};
