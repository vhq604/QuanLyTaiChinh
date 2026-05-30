const pool = require('../config/db.js');

const CategoriesModel = {
  getAll: async (userId) => {
    try {
      // Returns global categories (user_id IS NULL) + user's custom categories (user_id = ?)
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY type DESC, name ASC',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error in CategoriesModel.getAll:', error);
      throw error;
    }
  },

  getById: async (id, userId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)',
        [id, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in CategoriesModel.getById:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const { user_id, name, type, parent_id } = data;
      const [result] = await pool.query(
        'INSERT INTO categories (user_id, name, type, parent_id) VALUES (?, ?, ?, ?)',
        [user_id, name, type, parent_id || null]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in CategoriesModel.create:', error);
      throw error;
    }
  },

  update: async (id, userId, data) => {
    try {
      const { name, type, parent_id } = data;
      // We can only update categories that belong to the user (user_id = ?)
      const [result] = await pool.query(
        'UPDATE categories SET name = ?, type = ?, parent_id = ? WHERE id = ? AND user_id = ?',
        [name, type, parent_id || null, id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in CategoriesModel.update:', error);
      throw error;
    }
  },

  delete: async (id, userId) => {
    try {
      // We can only delete categories that belong to the user (user_id = ?)
      const [result] = await pool.query(
        'DELETE FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in CategoriesModel.delete:', error);
      throw error;
    }
  }
};

module.exports = CategoriesModel;
