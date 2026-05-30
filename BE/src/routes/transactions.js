const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController.js');

router.get('/expenses', TransactionController.getExpenses);
router.get('/accounts', TransactionController.getAccounts);
router.get('/categories', TransactionController.getCategories);

router.post('/expenses', TransactionController.createExpense);

router.put('/expenses/:id', TransactionController.updateExpense);

router.delete('/expenses/:id', TransactionController.deleteExpense);

module.exports = router;