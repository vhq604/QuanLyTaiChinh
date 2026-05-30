const pool = require('../config/db.js');

const TransactionModel = {
  getAll: async (userId, filters = {}) => {
    try {
      const { type, account_id, category_id, start_date, end_date } = filters;
      let query = `
        SELECT t.*, 
               fa.name AS from_account_name, 
               ta.name AS to_account_name, 
               c.name AS category_name
        FROM transactions t
        LEFT JOIN accounts fa ON t.from_account_id = fa.id
        LEFT JOIN accounts ta ON t.to_account_id = ta.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
      `;
      const params = [userId];

      if (type) {
        query += ' AND t.type = ?';
        params.push(type);
      }

      if (account_id) {
        query += ' AND (t.from_account_id = ? OR t.to_account_id = ?)';
        params.push(account_id, account_id);
      }

      if (category_id) {
        query += ' AND t.category_id = ?';
        params.push(category_id);
      }

      if (start_date) {
        query += ' AND t.transaction_date >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND t.transaction_date <= ?';
        params.push(end_date);
      }

      query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in TransactionModel.getAll:', error);
      throw error;
    }
  },

  getById: async (id, userId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in TransactionModel.getById:', error);
      throw error;
    }
  },

  create: async (userId, data) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { type, from_account_id, to_account_id, category_id, amount, note, transaction_date } = data;
      const parsedAmount = parseFloat(amount);

      // 1. Insert the transaction
      const [result] = await conn.query(
        `INSERT INTO transactions (user_id, type, from_account_id, to_account_id, category_id, amount, note, transaction_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          type,
          type === 'INCOME' ? null : from_account_id,
          type === 'EXPENSE' ? null : to_account_id,
          type === 'TRANSFER' ? null : category_id, // Transfers typically don't have categories
          parsedAmount,
          note || null,
          transaction_date
        ]
      );
      const transactionId = result.insertId;

      // 2. Adjust account balances
      if (type === 'EXPENSE' && from_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [parsedAmount, from_account_id, userId]
        );
      } else if (type === 'INCOME' && to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [parsedAmount, to_account_id, userId]
        );
      } else if (type === 'TRANSFER' && from_account_id && to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [parsedAmount, from_account_id, userId]
        );
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [parsedAmount, to_account_id, userId]
        );
      }

      await conn.commit();
      return transactionId;
    } catch (error) {
      await conn.rollback();
      console.error('Error in TransactionModel.create:', error);
      throw error;
    } finally {
      conn.release();
    }
  },

  delete: async (id, userId) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Fetch the existing transaction to know its details for balance reversal
      const [rows] = await conn.query(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      const tx = rows[0];

      if (!tx) {
        await conn.commit();
        return false; // Transaction not found
      }

      const parsedAmount = parseFloat(tx.amount);

      // 2. Reverse account balance changes
      if (tx.type === 'EXPENSE' && tx.from_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [parsedAmount, tx.from_account_id, userId]
        );
      } else if (tx.type === 'INCOME' && tx.to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [parsedAmount, tx.to_account_id, userId]
        );
      } else if (tx.type === 'TRANSFER' && tx.from_account_id && tx.to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [parsedAmount, tx.from_account_id, userId]
        );
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [parsedAmount, tx.to_account_id, userId]
        );
      }

      // 3. Delete the transaction
      const [result] = await conn.query(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      await conn.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await conn.rollback();
      console.error('Error in TransactionModel.delete:', error);
      throw error;
    } finally {
      conn.release();
    }
  },

  update: async (id, userId, data) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Fetch the old transaction to reverse its balance impact
      const [rows] = await conn.query(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      const oldTx = rows[0];

      if (!oldTx) {
        await conn.commit();
        return false;
      }

      const oldAmount = parseFloat(oldTx.amount);

      // Reverse old balance impact
      if (oldTx.type === 'EXPENSE' && oldTx.from_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [oldAmount, oldTx.from_account_id, userId]
        );
      } else if (oldTx.type === 'INCOME' && oldTx.to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [oldAmount, oldTx.to_account_id, userId]
        );
      } else if (oldTx.type === 'TRANSFER' && oldTx.from_account_id && oldTx.to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [oldAmount, oldTx.from_account_id, userId]
        );
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [oldAmount, oldTx.to_account_id, userId]
        );
      }

      // 2. Update the transaction
      const { type, from_account_id, to_account_id, category_id, amount, note, transaction_date } = data;
      const newAmount = parseFloat(amount);

      const [result] = await conn.query(
        `UPDATE transactions 
         SET type = ?, from_account_id = ?, to_account_id = ?, category_id = ?, amount = ?, note = ?, transaction_date = ?
         WHERE id = ? AND user_id = ?`,
        [
          type,
          type === 'INCOME' ? null : from_account_id,
          type === 'EXPENSE' ? null : to_account_id,
          type === 'TRANSFER' ? null : category_id,
          newAmount,
          note || null,
          transaction_date,
          id,
          userId
        ]
      );

      // 3. Apply new balance impact
      if (type === 'EXPENSE' && from_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [newAmount, from_account_id, userId]
        );
      } else if (type === 'INCOME' && to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [newAmount, to_account_id, userId]
        );
      } else if (type === 'TRANSFER' && from_account_id && to_account_id) {
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance - ? WHERE id = ? AND user_id = ?',
          [newAmount, from_account_id, userId]
        );
        await conn.query(
          'UPDATE accounts SET opening_balance = opening_balance + ? WHERE id = ? AND user_id = ?',
          [newAmount, to_account_id, userId]
        );
      }

      await conn.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await conn.rollback();
      console.error('Error in TransactionModel.update:', error);
      throw error;
    } finally {
      conn.release();
    }
  }
};

module.exports = TransactionModel;
