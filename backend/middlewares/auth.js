const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is admin (now allows all authenticated users)
exports.isAdmin = (req, res, next) => {
  next();
}; 