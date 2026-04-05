const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required'
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.only': 'Type must be income or expense',
    'any.required': 'Type is required'
  }),
  category: Joi.string().max(50).required().messages({
    'string.max': 'Category cannot exceed 50 characters',
    'any.required': 'Category is required'
  }),
  date: Joi.date().iso().max('now').default(Date.now),
  notes: Joi.string().max(500).allow('')
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive(),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().max(50),
  date: Joi.date().iso().max('now'),
  notes: Joi.string().max(500).allow('')
});

const queryRecordSchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string(),
  minAmount: Joi.number().min(0),
  maxAmount: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('date', 'amount', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  queryRecordSchema
};
