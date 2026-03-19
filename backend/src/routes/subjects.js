const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTopic,
  updateTopic,
  deleteTopic,
  markTopicStudied,
} = require('../controllers/subjectController');

// All routes require auth
router.use(protect);

// Subjects
router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

// Topics (nested under a subject)
router.post('/:id/topics', addTopic);
router.put('/:id/topics/:topicId', updateTopic);
router.delete('/:id/topics/:topicId', deleteTopic);
router.patch('/:id/topics/:topicId/study', markTopicStudied);

module.exports = router;
