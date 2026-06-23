const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Citizen = require('../Models/Citizen');
const logger = require('../utils/logger');

/** Generate a signed JWT for a user */
function generateToken(userId, role) {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** Normalize a Citizen document into a safe public user object */
function serializeUser(citizen) {
  return {
    id: citizen._id.toString(),
    _id: citizen._id.toString(),
    name: citizen.name,
    email: citizen.email,
    role: citizen.role,
    level: citizen.level,
    points: citizen.points,
    department: citizen.department || null,
    complaintsSubmitted: citizen.complaintsSubmitted,
    complaintsResolved: citizen.complaintsResolved,
    upvotesGiven: citizen.upvotesGiven,
    isActive: citizen.isActive,
    lastLogin: citizen.lastLogin,
    createdAt: citizen.createdAt,
  };
}

/** POST /api/auth/register */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await Citizen.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const citizen = await Citizen.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: 'citizen',
    });

    const token = generateToken(citizen._id, citizen.role);

    logger.info('New citizen registered', { email: citizen.email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: serializeUser(citizen),
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/login */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const citizen = await Citizen.findOne({ email: email.toLowerCase().trim() });
    if (!citizen || !citizen.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update lastLogin
    citizen.lastLogin = new Date();
    await citizen.save();

    const token = generateToken(citizen._id, citizen.role);

    logger.info('User logged in', { email: citizen.email, role: citizen.role });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: serializeUser(citizen),
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me — Return current user profile */
exports.getMe = async (req, res, next) => {
  try {
    // Re-fetch from DB to get latest data
    const citizen = await Citizen.findById(req.user._id).select('-password');
    if (!citizen || !citizen.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }
    res.status(200).json({ success: true, data: serializeUser(citizen) });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/logout — Invalidate session (client-side token removal) */
exports.logout = async (req, res) => {
  logger.info('User logged out', { userId: req.user?._id, email: req.user?.email });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
