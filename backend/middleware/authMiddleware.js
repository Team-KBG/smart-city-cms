const jwt = require('jsonwebtoken');
const Citizen = require('../Models/Citizen');
const logger = require('../utils/logger');

/**
 * Verifies JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Citizen.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('Auth middleware failed', { error: err.message });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block if missing.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Citizen.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Ignore auth errors in optional mode
  }
  next();
};

module.exports = { authMiddleware, optionalAuth };
