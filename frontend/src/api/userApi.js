import api from './courseApi';

export const getAllFaculty = async () => {
  const response = await api.get('/users/faculty');
  return response.data;
};
