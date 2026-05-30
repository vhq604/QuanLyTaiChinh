const CategoriesModel = require('../models/CategoriesModel.js');

const CategoriesController = {
  getCategories: async (req, res) => {
    try {
      const userId = req.user.id;
      const categories = await CategoriesModel.getAll(userId);
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error in CategoriesController.getCategories:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách danh mục.'
      });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const category = await CategoriesModel.getById(id, userId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục.'
        });
      }

      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error in CategoriesController.getCategoryById:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy thông tin danh mục.'
      });
    }
  },

  createCategory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, type, parent_id } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền tên và loại danh mục.'
        });
      }

      const validTypes = ['INCOME', 'EXPENSE'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Loại danh mục không hợp lệ. Phải là INCOME hoặc EXPENSE.'
        });
      }

      const categoryId = await CategoriesModel.create({
        user_id: userId,
        name,
        type,
        parent_id: parent_id ? parseInt(parent_id) : null
      });

      return res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công.',
        data: { id: categoryId }
      });
    } catch (error) {
      console.error('Error in CategoriesController.createCategory:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Danh mục có tên này đã tồn tại.'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi tạo danh mục.'
      });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { name, type, parent_id } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền tên và loại danh mục.'
        });
      }

      const validTypes = ['INCOME', 'EXPENSE'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Loại danh mục không hợp lệ. Phải là INCOME hoặc EXPENSE.'
        });
      }

      // Check if it exists and belongs to the user (global categories user_id is null, so it won't allow updating)
      const existing = await CategoriesModel.getById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục.'
        });
      }

      if (existing.user_id === null) {
        return res.status(403).json({
          success: false,
          message: 'Không thể sửa đổi danh mục mặc định của hệ thống.'
        });
      }

      const isUpdated = await CategoriesModel.update(id, userId, {
        name,
        type,
        parent_id: parent_id ? parseInt(parent_id) : null
      });

      if (!isUpdated) {
        return res.status(404).json({
          success: false,
          message: 'Cập nhật thất bại. Vui lòng thử lại.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật danh mục thành công.'
      });
    } catch (error) {
      console.error('Error in CategoriesController.updateCategory:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Danh mục có tên này đã tồn tại.'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi cập nhật danh mục.'
      });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if it exists and belongs to the user
      const existing = await CategoriesModel.getById(id, userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục.'
        });
      }

      if (existing.user_id === null) {
        return res.status(403).json({
          success: false,
          message: 'Không thể xóa danh mục mặc định của hệ thống.'
        });
      }

      const isDeleted = await CategoriesModel.delete(id, userId);

      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục để xóa.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Xóa danh mục thành công.'
      });
    } catch (error) {
      console.error('Error in CategoriesController.deleteCategory:', error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa danh mục này vì nó đang được dùng trong các giao dịch.'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi xóa danh mục.'
      });
    }
  }
};

module.exports = CategoriesController;
