const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const transactionsRouter = require('./routes/transactions.js');
app.use('/api/transactions', transactionsRouter);



module.exports = app;