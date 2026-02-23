import axios from 'axios';
import { clearAuth, getAuth } from './authApi';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('=== ENROLLMENT ERROR ===', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);
api.interceptors.request.use(config => {
    const auth = getAuth();
    if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            clearAuth();
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export const registerForCourse = (courseId, notes = '') => {
    return api.post('/enrollments/register', { courseId, notes });
};

export const getMyEnrollments = () => {
    return api.get('/enrollments/my-enrollments');
};

export const getPendingEnrollments = () => {
    return api.get('/enrollments/pending');
};

export const getAllEnrollments = () => {
    return api.get('/enrollments');
};

export const getEnrollmentsByCourse = (courseId) => {
    return api.get(`/enrollments/course/${courseId}`);
};

export const approveEnrollment = (enrollmentId) => {
    return api.put(`/enrollments/${enrollmentId}/approve`);
};

export const rejectEnrollment = (enrollmentId) => {
    return api.put(`/enrollments/${enrollmentId}/reject`);
};

export const dropCourse = (enrollmentId) => {
    return api.put(`/enrollments/${enrollmentId}/drop`);
};
