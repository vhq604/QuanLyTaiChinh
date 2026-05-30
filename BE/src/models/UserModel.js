const pool = require('../config/db.js');

const UserModel = {
  create: async (username, email, hashedPassword) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in UserModel.create:', error);
      throw error;
    }
  },

  findByUsername: async (username) => {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in UserModel.findByUsername:', error);
      throw error;
    }
  },

  findByEmail: async (email) => {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in UserModel.findByEmail:', error);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in UserModel.findById:', error);
      throw error;
    }
  }
};

module.exports = UserModel;
