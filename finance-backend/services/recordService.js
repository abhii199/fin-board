const FinancialRecord = require('../models/FinancialRecord');
const { AppError } = require('../middleware/errorHandler');

class RecordService {
  async create(data, userId) {
    const record = await FinancialRecord.create({
      ...data,
      user: userId
    });
    return record;
  }

  async getAll(userId, query) {
    const {
      startDate,
      endDate,
      type,
      category,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = query;

    const filter = { user: userId, isDeleted: false };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      FinancialRecord.countDocuments(filter)
    ]);

    return {
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id, userId) {
    const record = await FinancialRecord.findOne({ _id: id, user: userId, isDeleted: false });
    
    if (!record) {
      throw new AppError('Record not found', 404);
    }
    return record;
  }

  async update(id, userId, updateData) {
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: id, user: userId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!record) {
      throw new AppError('Record not found', 404);
    }
    return record;
  }

  async delete(id, userId) {
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: id, user: userId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!record) {
      throw new AppError('Record not found', 404);
    }
    return record;
  }

  async getCategories(userId) {
    const categories = await FinancialRecord.distinct('category', { user: userId, isDeleted: false });
    return categories;
  }
}

module.exports = new RecordService();
