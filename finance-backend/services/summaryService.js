const FinancialRecord = require('../models/FinancialRecord');
const { AppError } = require('../middleware/errorHandler');

class SummaryService {
  async getDashboardSummary(userId, query) {
    const { startDate, endDate, groupBy = 'month' } = query;
    
    const filter = { user: userId, isDeleted: false };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [totals, categoryTotals, recentActivity] = await Promise.all([
      this.getTotals(filter),
      this.getCategoryTotals(filter),
      this.getRecentActivity(userId, 5)
    ]);

    const summary = {
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      netBalance: totals.totalIncome - totals.totalExpenses,
      categoryBreakdown: categoryTotals,
      recentActivity
    };

    if (groupBy !== 'category') {
      summary.trends = await this.getTrends(filter, groupBy);
    }

    return summary;
  }

  async getTotals(filter) {
    const result = await FinancialRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totals = { totalIncome: 0, totalExpenses: 0 };
    result.forEach(item => {
      if (item._id === 'income') totals.totalIncome = item.total;
      if (item._id === 'expense') totals.totalExpenses = item.total;
    });

    return totals;
  }

  async getCategoryTotals(filter) {
    const results = await FinancialRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const breakdown = {
      income: [],
      expense: []
    };

    results.forEach(item => {
      breakdown[item._id.type].push({
        category: item._id.category,
        total: item.total,
        count: item.count
      });
    });

    return breakdown;
  }

  async getTrends(filter, groupBy) {
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        break;
      case 'week':
        dateFormat = { $dateToString: { format: '%Y-W%V', date: '$date' } };
        break;
      case 'month':
      default:
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
    }

    const trends = await FinancialRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { date: dateFormat, type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const groupedTrends = {};
    trends.forEach(item => {
      const date = item._id.date;
      if (!groupedTrends[date]) {
        groupedTrends[date] = { date, income: 0, expense: 0, count: 0 };
      }
      groupedTrends[date][item._id.type] = item.total;
      groupedTrends[date].count += item.count;
    });

    return Object.values(groupedTrends);
  }

  async getRecentActivity(userId, limit = 5) {
    const records = await FinancialRecord.find({
      user: userId,
      isDeleted: false
    })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .select('amount type category date notes');

    return records;
  }

  async getMonthlyComparison(userId, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const comparison = await FinancialRecord.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyData = {};
    comparison.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: key,
          income: 0,
          expense: 0,
          net: 0,
          transactionCount: 0
        };
      }
      if (item._id.type === 'income') {
        monthlyData[key].income = item.total;
      } else {
        monthlyData[key].expense = item.total;
      }
      monthlyData[key].transactionCount += item.count;
    });

    Object.values(monthlyData).forEach(month => {
      month.net = month.income - month.expense;
    });

    return Object.values(monthlyData);
  }

  async getTopCategories(userId, limit = 5, type = null) {
    const filter = { user: userId, isDeleted: false };
    if (type) filter.type = type;

    const topCategories = await FinancialRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: parseInt(limit) }
    ]);

    return topCategories.map(item => ({
      category: item._id,
      total: item.total,
      transactionCount: item.count
    }));
  }
}

module.exports = new SummaryService();
