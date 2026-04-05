const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be income or expense'
    },
    required: [true, 'Type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

financialRecordSchema.index({ user: 1, date: -1 });
financialRecordSchema.index({ user: 1, category: 1 });
financialRecordSchema.index({ user: 1, type: 1 });

financialRecordSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
