/**
 * Admin-only route guard. Must be used AFTER authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};

/**
 * Department staff or admin route guard.
 * For routes scoped to a specific department.
 */
const deptMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'department_staff') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Department staff or admin privileges required.',
    });
  }

  next();
};

module.exports = { adminMiddleware, deptMiddleware };
