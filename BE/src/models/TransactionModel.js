const pool = require('../config/db.js');

const TransactionModel = {
    getExpenses: async () => {
        try {
            const [rows] = await pool.query(`
            SELECT t.*, a.name AS account_name, c.name AS category_name
            FROM transactions t
            LEFT JOIN accounts a ON t.from_account_id = a.id
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.type = 'EXPENSE'
            ORDER BY t.transaction_date DESC, t.created_at DESC
        `);
        return rows;
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    createExpense: async (data) => {
        try {
            const { user_id, from_account_id, category_id, amount, note, transaction_date } = data;

            const [result] = await pool.query(`
            INSERT INTO transactions (user_id, type, from_account_id, to_account_id, category_id, amount, note, transaction_date)
            VALUES (?, 'EXPENSE', ?, NULL, ?, ?, ?, ?)
            `, [user_id,from_account_id, category_id, amount, note, transaction_date]);
            return { id: result.insertId };
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },

    deleteExpense: async (id) => {
        try {
            const [result] = await pool.query(`
                DELETE FROM transactions WHERE id = ?`,[id])
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    updateExpense: async (id, data) => {
        try {
            const { from_account_id, category_id, amount, note, transaction_date } = data;
            const [result] = await pool.query(`
                UPDATE transactions 
                SET from_account_id = ?, category_id = ?, amount = ?, note = ?, transaction_date = ? 
                WHERE id = ? AND type = 'EXPENSE'` ,[from_account_id, category_id, amount, note, transaction_date, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    getAccounts: async () => {
        try {
            const [rows] = await pool.query(`
                SELECT id, name FROM accounts
            `);
            return rows;
        } catch (error) {
            console.error('Error getting accounts:', error);
            throw error;
        }
    },

    getCategories: async () => {
        try {
            const [rows] = await pool.query(`
                SELECT id, name FROM categories
            `);
            return rows;
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }
};

module.exports = TransactionModel;