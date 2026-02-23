import axios from 'axios';
import { getAuth } from './authApi';
import { API_ROOT, toAbsoluteUrl } from './apiConfig';

const UPLOAD_BASE_URL = `${API_ROOT}/uploads`;

const uploadInstance = axios.create({
  baseURL: UPLOAD_BASE_URL,
  headers: {
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
uploadInstance.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    console.log('=== FILE UPLOAD REQUEST ===', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('=== FILE UPLOAD REQUEST ERROR ===', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
uploadInstance.interceptors.response.use(
  (response) => {
    console.log('=== FILE UPLOAD SUCCESS ===', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('=== FILE UPLOAD ERROR ===', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const uploadMaterial = async (file, title, description, courseId, materialType = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('courseId', courseId);
    
    if (materialType) {
      formData.append('materialType', materialType);
    }

    const response = await uploadInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('=== UPLOAD MATERIAL FAILED ===', error.response?.data?.error || error.message);
    throw error;
  }
};

export const getMaterialsByCourse = async (courseId) => {
  try {
    const response = await uploadInstance.get(`/course/${courseId}`);
    console.log('=== GET MATERIALS SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== GET MATERIALS ERROR ===', error.response?.data);
    throw error;
  }
};

export const getMaterialById = async (materialId) => {
  try {
    const response = await uploadInstance.get(`/${materialId}`);
    console.log('=== GET MATERIAL SUCCESS ===', response.data);
    return response.data;
  } catch (error) {
    console.error('=== GET MATERIAL ERROR ===', error.response?.data);
    throw error;
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    const response = await uploadInstance.delete(`/${materialId}`);
    console.log('=== DELETE MATERIAL SUCCESS ===');
    return response.data;
  } catch (error) {
    console.error('=== DELETE MATERIAL ERROR ===', error.response?.data);
    throw error;
  }
};

export const downloadMaterial = (materialUrl) => {
  try {
    const link = document.createElement('a');
    link.href = toAbsoluteUrl(materialUrl);
    link.download = materialUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('=== DOWNLOAD STARTED ===', materialUrl);
  } catch (error) {
    console.error('=== DOWNLOAD ERROR ===', error);
  }
};
