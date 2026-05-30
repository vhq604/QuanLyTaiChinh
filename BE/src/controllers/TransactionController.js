const TransactionModel = require('../models/TransactionModel.js');

const TransactionController = {
    getExpenses: async (req,res) => {
        try {
            
            const expenses = await TransactionModel.getExpenses();

            return res.status(200).json({
                success:true,
                data: expenses
            });
        } catch (error) {
            console.error('Error in TransactionController.getExpenses:', error);
            return res.status(500).json({
                success:false,
                message: 'Internal server error'
            });
        }
    },

    createExpense: async (req, res) => {
        try {
            // Lấy dữ liệu từ Frontend gửi lên
            const { from_account_id, category_id, amount, note, transaction_date } = req.body;

            // TẠM THỜI: Gán cứng user_id = 1 (vì chưa có tính năng đăng nhập)
            const user_id = 1; 

            // Gọi xuống Model và truyền thêm user_id vào
            const newExpenseId = await TransactionModel.createExpense({
                user_id, // <--- Nhét ông thần này vào đây
                from_account_id,
                category_id,
                amount,
                note,
                transaction_date
            });

            return res.status(201).json({
                success: true,
                message: 'Thêm khoản chi tiêu thành công',
                data: { id: newExpenseId }
            });

        } catch (error) {
            console.error('Error in TransactionController.createExpense:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    deleteExpense: async (req,res) => {
        try {
            const { id } = req.params;
            const isDeleted = await TransactionModel.deleteExpense(id);

            if (!isDeleted) {
                return res.status(404).json({
                    success:false,
                    message: 'Không tìm thấy khoản chi tiêu để xóa'
                });
            }
            return res.status(200).json({
                success:true,
                message: 'Xóa khoản chi tiêu thành công'
            });
        } catch (error) {
            console.error('Error in TransactionController.deleteExpense:', error);
            return res.status(500).json({
                success:false,
                message: 'Internal server error'
            });
        }
    },

    updateExpense: async (req,res) => {
        try {
            const { id } = req.params;
            const { from_account_id, category_id, amount, note, transaction_date } = req.body;

            const isUpdated = await TransactionModel.updateExpense(id, { from_account_id, category_id, amount, note, transaction_date });

            if (!isUpdated) {
                return res.status(404).json({
                    success:false,
                    message: 'Không tìm thấy khoản chi tiêu để cập nhật'
                });
            }
            return res.status(200).json({
                success:true,
                message: 'Cập nhật khoản chi tiêu thành công'
            });
        } catch (error) {
            console.error('Error in TransactionController.updateExpense:', error);
            return res.status(500).json({
                success:false,
                message: 'Internal server error'
            });
        }
    },

    getAccounts: async (req,res) => {
        try {
            const accounts = await TransactionModel.getAccounts();
            return res.status(200).json({
                success:true,
                data: accounts
            });
        } catch (error) {
            return res.status(500).json({
                success:false,
                message: 'Internal server error'
            });
        }
    },

    getCategories: async (req,res) => {
        try {
            const categories = await TransactionModel.getCategories();
            return res.status(200).json({
                success:true,
                data: categories
            });
        } catch (error) {
            return res.status(500).json({
                success:false,
                message: 'Internal server error'
            });
        }
    }


};

module.exports = TransactionController;