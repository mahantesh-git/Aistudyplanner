import axios from 'axios';

const API_URL = 'http://localhost:5000/api/subjects';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getSubjects = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await axios.post(API_URL, subjectData, getAuthHeaders());
  return response.data;
};

export const getSubject = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const updateSubject = async (id, subjectData) => {
  const response = await axios.put(`${API_URL}/${id}`, subjectData, getAuthHeaders());
  return response.data;
};

export const deleteSubject = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};
