const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/AccountController.js');
const auth = require('../middleware/auth.js');

// All account routes require authentication
router.use(auth);

router.get('/', AccountController.getAccounts);
router.get('/:id', AccountController.getAccountById);
router.post('/', AccountController.createAccount);
router.put('/:id', AccountController.updateAccount);
router.delete('/:id', AccountController.deleteAccount);

module.exports = router;
