const pool = require('../config/db.js');

const DashboardModel = {
  getSummary: async (userId) => {
    try {
      // 1. Current balance across all active accounts
      const [balanceRows] = await pool.query(
        'SELECT SUM(opening_balance) AS total_balance FROM accounts WHERE user_id = ? AND is_active = 1',
        [userId]
      );
      const totalBalance = parseFloat(balanceRows[0].total_balance) || 0;

      // 2. Total Income & Expense (overall or current month, let's do current month for dashboard context)
      const [monthlyRows] = await pool.query(
        `SELECT 
           SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS total_income,
           SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS total_expense
         FROM transactions
         WHERE user_id = ? AND MONTH(transaction_date) = MONTH(CURRENT_DATE()) AND YEAR(transaction_date) = YEAR(CURRENT_DATE())`,
        [userId]
      );
      
      const totalIncome = parseFloat(monthlyRows[0].total_income) || 0;
      const totalExpense = parseFloat(monthlyRows[0].total_expense) || 0;

      return {
        total_balance: totalBalance,
        monthly_income: totalIncome,
        monthly_expense: totalExpense
      };
    } catch (error) {
      console.error('Error in DashboardModel.getSummary:', error);
      throw error;
    }
  },

  getSpendingByCategory: async (userId) => {
    try {
      // Group expenses by category
      const [rows] = await pool.query(
        `SELECT c.name AS category_name, SUM(t.amount) AS total_amount
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = ? AND t.type = 'EXPENSE'
         GROUP BY t.category_id, c.name
         ORDER BY total_amount DESC`,
        [userId]
      );
      return rows.map(r => ({
        category_name: r.category_name,
        total_amount: parseFloat(r.total_amount) || 0
      }));
    } catch (error) {
      console.error('Error in DashboardModel.getSpendingByCategory:', error);
      throw error;
    }
  },

  getCashFlowTrend: async (userId) => {
    try {
      // Daily trend for the last 30 days
      const [rows] = await pool.query(
        `SELECT DATE(transaction_date) AS date,
                SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expense
         FROM transactions
         WHERE user_id = ? AND transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
         GROUP BY DATE(transaction_date)
         ORDER BY date ASC`,
        [userId]
      );
      return rows.map(r => ({
        date: r.date,
        income: parseFloat(r.income) || 0,
        expense: parseFloat(r.expense) || 0
      }));
    } catch (error) {
      console.error('Error in DashboardModel.getCashFlowTrend:', error);
      throw error;
    }
  }
};

module.exports = DashboardModel;
