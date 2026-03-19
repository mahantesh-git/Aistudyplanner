const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStudyPlan, generateAndSavePlan } = require('../controllers/studyPlanController');

router.use(protect);

router.get('/', getStudyPlan);              // preview plan
router.post('/generate', generateAndSavePlan); // save as tasks

module.exports = router;
