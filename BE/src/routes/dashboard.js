const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController.js');
const auth = require('../middleware/auth.js');

// Dashboard statistics require authentication
router.get('/', auth, DashboardController.getAnalytics);

module.exports = router;
