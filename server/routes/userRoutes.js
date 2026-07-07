const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const firController = require('../controllers/firController');
const tipController = require('../controllers/tipController');
const messageController = require('../controllers/messageController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Profile routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.editProfile);

// FIR management routes
router.post('/fir/file', protect, firController.fileFIR);
router.get('/fir/my-firs', protect, firController.getMyFIRs);
router.get('/fir/my-fir-details/:id', protect, firController.getMyFIRDetails);
router.put('/fir/edit/:id', protect, firController.editMyFIR);
router.post('/fir/report', protect, firController.reportFIR);

// Tip voting routes
router.post('/tips/:id/vote', protect, tipController.voteTip);
router.get('/tips/:id/vote-status', protect, tipController.getVoteStatus);

// Contact messages route (optional auth to capture user_id if logged in)
router.post('/messages', optionalProtect, messageController.submitMessage);

module.exports = router;
