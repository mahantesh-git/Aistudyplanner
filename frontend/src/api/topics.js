import axios from 'axios';

const SUBJECTS_URL = 'http://localhost:5000/api/subjects';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Topics are embedded in subjects — fetch all topics for a subject by
// loading the subject document and returning its topics array.
export const getTopics = async (subjectId) => {
  if (!subjectId) return [];
  const response = await axios.get(`${SUBJECTS_URL}/${subjectId}`, getAuthHeaders());
  return response.data.topics || [];
};

// POST /api/subjects/:subjectId/topics
// Backend expects { title, difficulty, estimatedTime }
export const createTopic = async (subjectId, topicData) => {
  const response = await axios.post(
    `${SUBJECTS_URL}/${subjectId}/topics`,
    topicData,
    getAuthHeaders()
  );
  // Returns the full updated subject; return topics for convenience
  return response.data;
};

// PUT /api/subjects/:subjectId/topics/:topicId
export const updateTopic = async (subjectId, topicId, topicData) => {
  const response = await axios.put(
    `${SUBJECTS_URL}/${subjectId}/topics/${topicId}`,
    topicData,
    getAuthHeaders()
  );
  return response.data;
};

// DELETE /api/subjects/:subjectId/topics/:topicId
export const deleteTopic = async (subjectId, topicId) => {
  const response = await axios.delete(
    `${SUBJECTS_URL}/${subjectId}/topics/${topicId}`,
    getAuthHeaders()
  );
  return response.data;
};

// PATCH /api/subjects/:subjectId/topics/:topicId/study
export const markTopicStudied = async (subjectId, topicId) => {
  const response = await axios.patch(
    `${SUBJECTS_URL}/${subjectId}/topics/${topicId}/study`,
    {},
    getAuthHeaders()
  );
  return response.data;
};
