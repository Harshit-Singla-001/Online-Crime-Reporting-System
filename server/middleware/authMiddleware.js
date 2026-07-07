const jwt = require('jsonwebtoken');
const User = require('../models/User');

const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
};

const protect = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    let token = cookies.token;

    // Fallback to Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user/staff still exists and is active
    let user;
    if (decoded.role === 'admin') {
      const Staff = require('../models/Staff');
      user = await Staff.findById(decoded.user_id);
    } else {
      user = await User.findById(decoded.user_id);
    }

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (user.status === 'suspended' || user.status === 'blocked') {
      // Check if blocked_until has passed
      if (user.status === 'blocked' && user.blocked_until && new Date() > user.blocked_until) {
        // Auto-unblock
        user.status = 'active';
        user.failed_attempts = 0;
        user.blocked_until = null;
        await user.save();
      } else {
        return res.status(403).json({ 
          message: `Account is ${user.status}.`, 
          status: user.status,
          blocked_until: user.blocked_until 
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    let token = cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;
      if (decoded.role === 'admin') {
        const Staff = require('../models/Staff');
        user = await Staff.findById(decoded.user_id);
      } else {
        user = await User.findById(decoded.user_id);
      }
      if (user && user.status !== 'suspended' && user.status !== 'blocked') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};

module.exports = {
  protect,
  optionalProtect,
  adminOnly
};
