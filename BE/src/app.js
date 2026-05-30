const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

const transactionsRouter = require('./routes/transactions.js');
app.use('/api/transactions', transactionsRouter);

const usersRouter = require('./routes/users.js');
app.use('/api/users', usersRouter);

const accountsRouter = require('./routes/accounts.js');
app.use('/api/accounts', accountsRouter);

const categoriesRouter = require('./routes/categories.js');
app.use('/api/categories', categoriesRouter);

const dashboardRouter = require('./routes/dashboard.js');
app.use('/api/dashboard', dashboardRouter);

module.exports = app;