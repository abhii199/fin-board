const summaryService = require('../services/summaryService');

class SummaryController {
  async getDashboardSummary(req, res, next) {
    try {
      const summary = await summaryService.getDashboardSummary(req.user._id, req.query);
      res.json({
        success: true,
        data: { summary }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyComparison(req, res, next) {
    try {
      const { months = 6 } = req.query;
      const comparison = await summaryService.getMonthlyComparison(req.user._id, parseInt(months));
      res.json({
        success: true,
        data: { comparison }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopCategories(req, res, next) {
    try {
      const { limit = 5, type } = req.query;
      const categories = await summaryService.getTopCategories(req.user._id, limit, type);
      res.json({
        success: true,
        data: { topCategories: categories }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SummaryController();
