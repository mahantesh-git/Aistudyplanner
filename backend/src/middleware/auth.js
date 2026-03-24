const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  console.log('Auth middleware called for:', req.method, req.url);
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log('Token found:', !!token);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized — user not found' });
    }

    console.log('User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    return res.status(401).json({ message: 'Not authorized — invalid or expired token' });
  }
};

module.exports = { protect };
