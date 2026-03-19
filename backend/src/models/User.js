const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    preferences: {
      dailyStudyHours: { type: Number, default: 4 },
      preferredTimeSlots: { type: [String], default: ['morning'] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
