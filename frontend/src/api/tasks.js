import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// GET /api/tasks          (optional ?date=YYYY-MM-DD filter)
export const getTasks = async (date) => {
  const url = date ? `${API_URL}?date=${date}` : API_URL;
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

// GET /api/tasks/:id
export const getTask = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

// POST /api/tasks
export const createTask = async (taskData) => {
  const response = await axios.post(API_URL, taskData, getAuthHeaders());
  return response.data;
};

// PUT /api/tasks/:id
export const updateTask = async (id, taskData) => {
  const response = await axios.put(`${API_URL}/${id}`, taskData, getAuthHeaders());
  return response.data;
};

// DELETE /api/tasks/:id
export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

// PATCH /api/tasks/:id/complete   ← was missing
export const completeTask = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/complete`, {}, getAuthHeaders());
  return response.data;
};
