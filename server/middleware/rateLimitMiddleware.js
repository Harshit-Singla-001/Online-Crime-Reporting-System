const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes (login, signup, OTP, reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth-related requests per window
  message: {
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter
};
