const express = require('express');
const router = express.Router();
const firController = require('../controllers/firController');
const tipController = require('../controllers/tipController');

// Public FIR records (Approved and Solved only)
router.get('/fir-records', firController.getPublicFIRRecords);
router.get('/fir-details/:id', firController.getPublicFIRDetails);

// Public Safety Tips
router.get('/tips', tipController.getAllTips);
router.get('/tip-details/:id', tipController.getTipDetails);

module.exports = router;
