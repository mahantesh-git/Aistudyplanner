const User = require('../models/User');

// @desc  Get user profile
// @route GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc  Update user profile
// @route PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, preferences } },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = { getProfile, updateProfile };
