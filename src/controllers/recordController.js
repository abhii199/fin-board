import { z } from 'zod';
import FinancialRecord from '../models/Financial-Records.js';

const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(1).max(50),
  date: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional(),
  userId: z.string().trim().optional()
});

const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional()
});

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const resolveTargetUser = (req) => {
  if (req.user.role === 'admin' && req.query.userId) {
    return req.query.userId;
  }
  return req.user._id;
};

const createRecord = async (req, res, next) => {
  try {
    const body = createRecordSchema.parse(req.body);

    const user = req.user.role === 'admin' && body.userId ? body.userId : req.user._id;

    const record = await FinancialRecord.create({
      amount: body.amount,
      type: body.type,
      category: body.category,
      date: body.date || new Date(),
      notes: body.notes,
      user
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: { record }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.flattenError(error).fieldErrors
      });
    }
    next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const query = { user: resolveTargetUser(req) };

    if (req.query.type) query.type = req.query.type;
    if (req.query.category) query.category = req.query.category;

    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      FinancialRecord.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      FinancialRecord.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        page,
        limit,
        total,
        records
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);

    if (!record) {
      throw createError('Record not found', 404);
    }

    if (req.user.role !== 'admin' && String(record.user) !== String(req.user._id)) {
      throw createError('Not authorized to access this record', 403);
    }

    res.json({
      success: true,
      data: { record }
    });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const body = updateRecordSchema.parse(req.body);
    const record = await FinancialRecord.findById(req.params.id);

    if (!record) {
      throw createError('Record not found', 404);
    }

    if (req.user.role !== 'admin' && String(record.user) !== String(req.user._id)) {
      throw createError('Not authorized to update this record', 403);
    }

    Object.assign(record, body);
    await record.save();

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: { record }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.flattenError(error).fieldErrors
      });
    }
    next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);

    if (!record) {
      throw createError('Record not found', 404);
    }

    if (req.user.role !== 'admin' && String(record.user) !== String(req.user._id)) {
      throw createError('Not authorized to delete this record', 403);
    }

    record.isDeleted = true;
    await record.save();

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
