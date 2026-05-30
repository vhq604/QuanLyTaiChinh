const pool = require('../config/db.js');

const AccountModel = {
  getAll: async (userId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error in AccountModel.getAll:', error);
      throw error;
    }
  },

  getById: async (id, userId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in AccountModel.getById:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const { user_id, name, type, opening_balance, currency } = data;
      const [result] = await pool.query(
        'INSERT INTO accounts (user_id, name, type, opening_balance, currency, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [user_id, name, type, opening_balance || 0, currency || 'VND']
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in AccountModel.create:', error);
      throw error;
    }
  },

  update: async (id, userId, data) => {
    try {
      const { name, type, opening_balance, currency, is_active } = data;
      const [result] = await pool.query(
        'UPDATE accounts SET name = ?, type = ?, opening_balance = ?, currency = ?, is_active = ? WHERE id = ? AND user_id = ?',
        [name, type, opening_balance, currency, is_active !== undefined ? is_active : 1, id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in AccountModel.update:', error);
      throw error;
    }
  },

  delete: async (id, userId) => {
    try {
      // Try to physically delete first. If foreign key constraint fails, we'll catch and soft delete.
      const [result] = await pool.query(
        'DELETE FROM accounts WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return { success: result.affectedRows > 0, softDeleted: false };
    } catch (error) {
      // Check if it's a foreign key constraint violation (ER_ROW_IS_REFERENCED_2 or ER_ROW_IS_REFERENCED)
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        const [result] = await pool.query(
          'UPDATE accounts SET is_active = 0 WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return { success: result.affectedRows > 0, softDeleted: true };
      }
      throw error;
    }
  }
};

module.exports = AccountModel;
