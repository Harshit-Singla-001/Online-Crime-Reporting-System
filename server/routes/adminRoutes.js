const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const tipController = require('../controllers/tipController');
const messageController = require('../controllers/messageController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Dashboard statistics
router.get('/stats', protect, adminOnly, adminController.getStats);

// FIR Moderation
router.get('/firs', protect, adminOnly, adminController.getAllFIRs);
router.get('/fir/details/:id', protect, adminOnly, adminController.getAdminFIRDetails);
router.put('/fir/status/:id', protect, adminOnly, adminController.updateFIRStatus);

// User Moderation
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.put('/user/:id/block', protect, adminOnly, adminController.toggleUserBlock);

// Site Settings
router.get('/settings', protect, adminOnly, adminController.getSettings);
router.put('/settings', protect, adminOnly, adminController.updateSettings);

// Admin Profile
router.get('/profile', protect, adminOnly, adminController.getAdminProfile);
router.put('/profile', protect, adminOnly, adminController.updateAdminProfile);

// Query Messages
router.get('/messages', protect, adminOnly, messageController.getAllMessages);
router.put('/messages/:id/status', protect, adminOnly, messageController.updateMessageStatus);

// Tips CRUD
router.post('/tips', protect, adminOnly, tipController.createTip);
router.put('/tips/:id', protect, adminOnly, tipController.updateTip);
router.delete('/tips/:id', protect, adminOnly, tipController.deleteTip);

module.exports = router;
