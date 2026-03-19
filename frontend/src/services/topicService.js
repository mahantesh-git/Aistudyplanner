import { getTopics, createTopic, updateTopic, deleteTopic, markTopicStudied } from '../api/topics';

const topicService = {
  // Get topics for a specific subject
  getAll: (subjectId) => getTopics(subjectId),

  // Create a topic — backend uses 'title' not 'name'
  // topicData: { title, difficulty, estimatedTime }
  create: (subjectId, topicData) => createTopic(subjectId, topicData),

  // Update topic
  update: (subjectId, topicId, data) => updateTopic(subjectId, topicId, data),

  // Delete topic — needs both subjectId and topicId
  delete: (subjectId, topicId) => deleteTopic(subjectId, topicId),

  // Mark as studied
  markStudied: (subjectId, topicId) => markTopicStudied(subjectId, topicId),
};

export default topicService;
