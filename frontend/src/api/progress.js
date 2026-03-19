import axios from 'axios';

// Backend base: /api/progress
// Routes:
//   GET /api/progress/completion   → topic completion rates per subject
//   GET /api/progress/study-hours  → ?period=today|week|month
//   GET /api/progress/stats        → overall stats summary
const API_URL = 'http://localhost:5000/api/progress';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// GET /api/progress/completion
export const getCompletionRates = async () => {
  const response = await axios.get(`${API_URL}/completion`, getAuthHeaders());
  return response.data;
};

// GET /api/progress/study-hours?period=today|week|month
export const getStudyHours = async (period = 'week') => {
  const response = await axios.get(`${API_URL}/study-hours?period=${period}`, getAuthHeaders());
  return response.data;
};

// GET /api/progress/stats
export const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
  return response.data;
};
