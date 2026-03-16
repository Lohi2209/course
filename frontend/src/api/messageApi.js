import axios from 'axios';
import { getAuth } from './authApi';
import { API_ROOT } from './apiConfig';

const api = axios.create({ baseURL: `${API_ROOT}/messages` });

api.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

export const getInbox = async () => {
  const res = await api.get('/inbox');
  return res.data;
};

export const getSentMessages = async () => {
  const res = await api.get('/sent');
  return res.data;
};

export const getCourseDiscussion = async (courseId) => {
  const res = await api.get(`/course/${courseId}`);
  return res.data;
};

export const getThread = async (messageId) => {
  const res = await api.get(`/${messageId}/thread`);
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get('/unread-count');
  return res.data.unreadCount;
};

export const sendMessage = async (payload) => {
  const res = await api.post('', payload);
  return res.data;
};

export const replyToMessage = async (messageId, body) => {
  const res = await api.post(`/${messageId}/reply`, { body });
  return res.data;
};

export const markRead = async (messageId) => {
  const res = await api.put(`/${messageId}/read`);
  return res.data;
};

export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/${messageId}`);
  return res.data;
};

export const getContacts = async () => {
  const res = await api.get('/contacts');
  return res.data;
};
