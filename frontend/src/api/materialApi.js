import api from './courseApi';

export const getAllMaterials = async () => {
  const response = await api.get('/materials');
  return response.data;
};

export const getMaterialsByCourse = async (courseId) => {
  const response = await api.get(`/materials/course/${courseId}`);
  return response.data;
};

export const createMaterial = async (material) => {
  const response = await api.post('/materials', material);
  return response.data;
};

export const updateMaterial = async (id, material) => {
  const response = await api.put(`/materials/${id}`, material);
  return response.data;
};

export const deleteMaterial = async (id) => {
  await api.delete(`/materials/${id}`);
};
