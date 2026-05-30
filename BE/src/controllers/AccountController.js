const AccountModel = require('../models/AccountModel.js');

const AccountController = {
  getAccounts: async (req, res) => {
    try {
      const userId = req.user.id;
      const accounts = await AccountModel.getAll(userId);
      return res.status(200).json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('Error in AccountController.getAccounts:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách tài khoản.'
      });
    }
  },

  getAccountById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const account = await AccountModel.getById(id, userId);

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản.'
        });
      }

      return res.status(200).json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Error in AccountController.getAccountById:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy thông tin tài khoản.'
      });
    }
  },

  createAccount: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, type, opening_balance, currency } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền tên và loại tài khoản.'
        });
      }

      const validTypes = ['CASH', 'BANK', 'EWALLET', 'SAVINGS'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Loại tài khoản không hợp lệ. Phải là CASH, BANK, EWALLET, hoặc SAVINGS.'
        });
      }

      const accountId = await AccountModel.create({
        user_id: userId,
        name,
        type,
        opening_balance: parseFloat(opening_balance) || 0,
        currency: currency || 'VND'
      });

      return res.status(201).json({
        success: true,
        message: 'Tạo tài khoản thành công.',
        data: { id: accountId }
      });
    } catch (error) {
      console.error('Error in AccountController.createAccount:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi tạo tài khoản.'
      });
    }
  },

  updateAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { name, type, opening_balance, currency, is_active } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền tên và loại tài khoản.'
        });
      }

      const validTypes = ['CASH', 'BANK', 'EWALLET', 'SAVINGS'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Loại tài khoản không hợp lệ. Phải là CASH, BANK, EWALLET, hoặc SAVINGS.'
        });
      }

      const isUpdated = await AccountModel.update(id, userId, {
        name,
        type,
        opening_balance: parseFloat(opening_balance) || 0,
        currency: currency || 'VND',
        is_active: is_active === undefined ? 1 : is_active
      });

      if (!isUpdated) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản hoặc bạn không có quyền cập nhật.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật tài khoản thành công.'
      });
    } catch (error) {
      console.error('Error in AccountController.updateAccount:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi cập nhật tài khoản.'
      });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await AccountModel.delete(id, userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản hoặc bạn không có quyền xóa.'
        });
      }

      if (result.softDeleted) {
        return res.status(200).json({
          success: true,
          message: 'Tài khoản này đã có giao dịch phát sinh. Hệ thống đã chuyển trạng thái tài khoản sang ẩn thay vì xóa hoàn toàn.',
          data: { softDeleted: true }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Xóa tài khoản thành công.',
        data: { softDeleted: false }
      });
    } catch (error) {
      console.error('Error in AccountController.deleteAccount:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi xóa tài khoản.'
      });
    }
  }
};

module.exports = AccountController;
