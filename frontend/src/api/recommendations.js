import axios from 'axios';

// Backend base: /api/recommendations
// Routes:
//   GET /api/recommendations               → full summary (all of the below)
//   GET /api/recommendations/weak-topics   → topics with low score
//   GET /api/recommendations/stale-topics  → ?days=7 (not studied recently)
//   GET /api/recommendations/revisions     → topics due for revision
//   GET /api/recommendations/tips          → general study tips
const API_URL = 'http://localhost:5000/api/recommendations';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// GET /api/recommendations  — full summary (all recommendation types)
export const getAllRecommendations = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

// GET /api/recommendations/weak-topics
export const getWeakTopics = async () => {
  const response = await axios.get(`${API_URL}/weak-topics`, getAuthHeaders());
  return response.data;
};

// GET /api/recommendations/stale-topics?days=7
export const getStaleTopics = async (days = 7) => {
  const response = await axios.get(`${API_URL}/stale-topics?days=${days}`, getAuthHeaders());
  return response.data;
};

// GET /api/recommendations/revisions
export const getRevisions = async () => {
  const response = await axios.get(`${API_URL}/revisions`, getAuthHeaders());
  return response.data;
};

// GET /api/recommendations/tips
export const getTips = async () => {
  const response = await axios.get(`${API_URL}/tips`, getAuthHeaders());
  return response.data;
};
