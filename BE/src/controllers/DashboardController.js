const DashboardModel = require('../models/DashboardModel.js');

const DashboardController = {
  getAnalytics: async (req, res) => {
    try {
      const userId = req.user.id;

      const summary = await DashboardModel.getSummary(userId);
      const categoryDistribution = await DashboardModel.getSpendingByCategory(userId);
      const trend = await DashboardModel.getCashFlowTrend(userId);

      return res.status(200).json({
        success: true,
        data: {
          summary,
          categoryDistribution,
          trend
        }
      });
    } catch (error) {
      console.error('Error in DashboardController.getAnalytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi lấy dữ liệu thống kê.'
      });
    }
  }
};

module.exports = DashboardController;
