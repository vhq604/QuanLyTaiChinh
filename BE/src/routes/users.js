const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController.js');
const auth = require('../middleware/auth.js');

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes
router.get('/me', auth, UserController.getMe);

module.exports = router;
