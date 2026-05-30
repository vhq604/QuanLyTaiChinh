const TransactionModel = require('../models/TransactionModel.js');

const TransactionController = {
  getTransactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const { type, account_id, category_id, start_date, end_date } = req.query;

      const filters = { type, account_id, category_id, start_date, end_date };
      const transactions = await TransactionModel.getAll(userId, filters);

      return res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Error in TransactionController.getTransactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy danh sách giao dịch.'
      });
    }
  },

  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const transaction = await TransactionModel.getById(id, userId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giao dịch.'
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Error in TransactionController.getTransactionById:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy chi tiết giao dịch.'
      });
    }
  },

  createTransaction: async (req, res) => {
    try {
      const userId = req.user.id;
      const { type, from_account_id, to_account_id, category_id, amount, note, transaction_date } = req.body;

      if (!type || !amount || !transaction_date) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập loại giao dịch, số tiền và ngày giao dịch.'
        });
      }

      const validTypes = ['INCOME', 'EXPENSE', 'TRANSFER'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Loại giao dịch không hợp lệ.'
        });
      }

      // Validations based on type
      if (type === 'EXPENSE' && !from_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Giao dịch chi tiêu cần chọn tài khoản nguồn.'
        });
      }
      if (type === 'INCOME' && !to_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Giao dịch thu nhập cần chọn tài khoản đích.'
        });
      }
      if (type === 'TRANSFER' && (!from_account_id || !to_account_id)) {
        return res.status(400).json({
          success: false,
          message: 'Giao dịch chuyển khoản cần có cả tài khoản nguồn và đích.'
        });
      }

      const transactionId = await TransactionModel.create(userId, {
        type,
        from_account_id,
        to_account_id,
        category_id,
        amount,
        note,
        transaction_date
      });

      return res.status(201).json({
        success: true,
        message: 'Thêm giao dịch thành công.',
        data: { id: transactionId }
      });
    } catch (error) {
      console.error('Error in TransactionController.createTransaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi thêm giao dịch.'
      });
    }
  },

  updateTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { type, from_account_id, to_account_id, category_id, amount, note, transaction_date } = req.body;

      if (!type || !amount || !transaction_date) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập loại giao dịch, số tiền và ngày giao dịch.'
        });
      }

      const isUpdated = await TransactionModel.update(id, userId, {
        type,
        from_account_id,
        to_account_id,
        category_id,
        amount,
        note,
        transaction_date
      });

      if (!isUpdated) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giao dịch hoặc bạn không có quyền cập nhật.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật giao dịch thành công.'
      });
    } catch (error) {
      console.error('Error in TransactionController.updateTransaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi cập nhật giao dịch.'
      });
    }
  },

  deleteTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const isDeleted = await TransactionModel.delete(id, userId);

      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giao dịch hoặc bạn không có quyền xóa.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Xóa giao dịch thành công.'
      });
    } catch (error) {
      console.error('Error in TransactionController.deleteTransaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi xóa giao dịch.'
      });
    }
  }
};

module.exports = TransactionController;
