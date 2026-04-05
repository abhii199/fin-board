const Joi = require('joi');

const summaryQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  groupBy: Joi.string().valid('day', 'week', 'month', 'category').default('month'),
  category: Joi.string()
});

module.exports = { summaryQuerySchema };
