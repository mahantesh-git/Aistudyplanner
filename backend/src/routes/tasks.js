const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateTaskInput, validateDateQuery } = require('../middleware/validation');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} = require('../controllers/taskController');

router.use(protect);

router.get('/', validateDateQuery, getTasks);
router.get('/:id', getTask);
router.post('/', validateTaskInput, createTask);
router.put('/:id', validateTaskInput, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', completeTask);

module.exports = router;
