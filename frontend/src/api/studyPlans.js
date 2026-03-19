import axios from 'axios';

// Backend base: /api/study-plan  (NOT /study-plans)
// Routes:
//   GET  /api/study-plan          → preview generated plan
//   POST /api/study-plan/generate → generate & save as tasks
const API_URL = 'http://localhost:5000/api/study-plan';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// GET /api/study-plan  — returns a preview of the AI-generated plan
export const getStudyPlan = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

// POST /api/study-plan/generate  — generate plan and persist it as tasks
export const generateAndSavePlan = async () => {
  const response = await axios.post(`${API_URL}/generate`, {}, getAuthHeaders());
  return response.data;
};
