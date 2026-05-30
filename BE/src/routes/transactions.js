const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController.js');
const auth = require('../middleware/auth.js');

router.use(auth);

router.get('/', TransactionController.getTransactions);
router.post('/', TransactionController.createTransaction);
router.get('/:id', TransactionController.getTransactionById);
router.put('/:id', TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

module.exports = router;
