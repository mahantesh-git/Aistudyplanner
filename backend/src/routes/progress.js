const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCompletionRates,
  getStudyHours,
  getStats,
} = require('../controllers/progressController');

router.use(protect);

router.get('/completion', getCompletionRates);
router.get('/study-hours', getStudyHours);  // ?period=today|week|month
router.get('/stats', getStats);

module.exports = router;
