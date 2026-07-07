const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// CAPTCHA route
router.get('/captcha', authController.getCaptcha);

// Signup routes
router.post('/signup', authLimiter, authController.signupStep1);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/complete-signup', authLimiter, authController.completeSignup);

// Login & Logout
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);

// Forgot Password flows
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/forgot-otp', authLimiter, authController.forgotOtpRequest);
router.post('/forgot-otp-verify', authLimiter, authController.forgotOtpVerify);
router.post('/forgot-key', authLimiter, authController.forgotKeyRequest);
router.post('/forgot-key-verify', authLimiter, authController.forgotKeyVerify);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Session check
router.get('/me', protect, authController.me);

module.exports = router;
