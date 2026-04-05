import FinancialRecord from '../models/Financial-Records.js';

const resolveTargetUser = (req) => {
  if (req.user.role === 'admin' && req.query.userId) {
    return req.query.userId;
  }
  return req.user._id;
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const user = resolveTargetUser(req);

    const match = {
      user,
      isDeleted: false
    };

    if (req.query.from || req.query.to) {
      match.date = {};
      if (req.query.from) match.date.$gte = new Date(req.query.from);
      if (req.query.to) match.date.$lte = new Date(req.query.to);
    }

    const [totals, categoryTotals, recentActivity] = await Promise.all([
      FinancialRecord.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]),
      FinancialRecord.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        },
        { $sort: { total: -1 } }
      ]),
      FinancialRecord.find(match).sort({ date: -1 }).limit(5)
    ]);

    const income = totals.find((item) => item._id === 'income')?.total || 0;
    const expenses = totals.find((item) => item._id === 'expense')?.total || 0;

    res.json({
      success: true,
      data: {
        totals: {
          income,
          expenses,
          netBalance: income - expenses
        },
        categoryTotals,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const user = resolveTargetUser(req);
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const trends = await FinancialRecord.aggregate([
      {
        $match: {
          user,
          isDeleted: false,
          date: { $gte: start }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          items: {
            $push: {
              type: '$_id.type',
              total: '$total'
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const result = trends.map((entry) => {
      const income = entry.items.find((item) => item.type === 'income')?.total || 0;
      const expenses = entry.items.find((item) => item.type === 'expense')?.total || 0;

      return {
        year: entry._id.year,
        month: entry._id.month,
        income,
        expenses,
        net: income - expenses
      };
    });

    res.json({
      success: true,
      data: {
        months,
        trends: result
      }
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboardSummary, getMonthlyTrends };
