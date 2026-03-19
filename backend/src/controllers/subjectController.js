const Subject = require('../models/Subject');

// ────────────────────────────── SUBJECTS ────────────────────────────────────

// @desc  Get all subjects for logged-in user
// @route GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ priority: -1, name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('getSubjects error:', error);
    res.status(500).json({ message: 'Server error fetching subjects' });
  }
};

// @desc  Get single subject
// @route GET /api/subjects/:id
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    console.error('getSubject error:', error);
    res.status(500).json({ message: 'Server error fetching subject' });
  }
};

// @desc  Create a subject
// @route POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const { name, priority } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name is required' });
    const subject = await Subject.create({ userId: req.user._id, name, priority });
    res.status(201).json(subject);
  } catch (error) {
    console.error('createSubject error:', error);
    res.status(500).json({ message: 'Server error creating subject' });
  }
};

// @desc  Update a subject
// @route PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const { name, priority } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { name, priority } },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    console.error('updateSubject error:', error);
    res.status(500).json({ message: 'Server error updating subject' });
  }
};

// @desc  Delete a subject (and all its topics)
// @route DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('deleteSubject error:', error);
    res.status(500).json({ message: 'Server error deleting subject' });
  }
};

// ────────────────────────────── TOPICS ──────────────────────────────────────

// @desc  Add a topic to a subject
// @route POST /api/subjects/:id/topics
const addTopic = async (req, res) => {
  try {
    const { title, difficulty, estimatedTime } = req.body;
    if (!title) return res.status(400).json({ message: 'Topic title is required' });

    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    subject.topics.push({ title, difficulty, estimatedTime });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error('addTopic error:', error);
    res.status(500).json({ message: 'Server error adding topic' });
  }
};

// @desc  Update a topic
// @route PUT /api/subjects/:id/topics/:topicId
const updateTopic = async (req, res) => {
  try {
    const { title, difficulty, estimatedTime, completed, lastStudied } = req.body;
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const topic = subject.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    if (title !== undefined) topic.title = title;
    if (difficulty !== undefined) topic.difficulty = difficulty;
    if (estimatedTime !== undefined) topic.estimatedTime = estimatedTime;
    if (completed !== undefined) topic.completed = completed;
    if (lastStudied !== undefined) topic.lastStudied = lastStudied;

    await subject.save();
    res.json(subject);
  } catch (error) {
    console.error('updateTopic error:', error);
    res.status(500).json({ message: 'Server error updating topic' });
  }
};

// @desc  Delete a topic
// @route DELETE /api/subjects/:id/topics/:topicId
const deleteTopic = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const topic = subject.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.deleteOne();
    await subject.save();
    res.json({ message: 'Topic deleted', subject });
  } catch (error) {
    console.error('deleteTopic error:', error);
    res.status(500).json({ message: 'Server error deleting topic' });
  }
};

// @desc  Mark a topic as studied (sets lastStudied = now, toggles completed)
// @route PATCH /api/subjects/:id/topics/:topicId/study
const markTopicStudied = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const topic = subject.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.lastStudied = new Date();
    topic.completed = true;
    await subject.save();
    res.json(subject);
  } catch (error) {
    console.error('markTopicStudied error:', error);
    res.status(500).json({ message: 'Server error marking topic as studied' });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTopic,
  updateTopic,
  deleteTopic,
  markTopicStudied,
};
