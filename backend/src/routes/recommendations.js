const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWeakTopicsEndpoint,
  getStaleTopicsEndpoint,
  getRevisions,
  getTips,
  getAllRecommendations,
} = require('../controllers/recommendationController');

router.use(protect);

router.get('/', getAllRecommendations);             // full summary
router.get('/weak-topics', getWeakTopicsEndpoint);
router.get('/stale-topics', getStaleTopicsEndpoint); // ?days=7
router.get('/revisions', getRevisions);
router.get('/tips', getTips);

module.exports = router;
