import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }  return config;});

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;};

export const createUser = async (token, userData) => {
  const response = await api.post('/users', userData, {
    headers: {
      Authorization: `Bearer ${token}`,    },  });
  return response.data;};

export const getUsers = async (token) => {
  const response = await api.get('/users', {
    headers: {
      Authorization: `Bearer ${token}`,    },  });
  return response.data;};





export default api;
