const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: Number, min: 1, max: 5, default: 3 },
  estimatedTime: { type: Number, default: 60 }, // in minutes
  completed: { type: Boolean, default: false },
  lastStudied: { type: Date, default: null },
});

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    priority: { type: Number, min: 1, max: 5, default: 3 },
    topics: [topicSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
