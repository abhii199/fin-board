require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      email: 'admin@finance.com',
      password: 'admin123',
      name: 'System Admin',
      role: 'admin',
      status: 'active'
    });

    const analyst = await User.create({
      email: 'analyst@finance.com',
      password: 'analyst123',
      name: 'Financial Analyst',
      role: 'analyst',
      status: 'active'
    });

    const viewer = await User.create({
      email: 'viewer@finance.com',
      password: 'viewer123',
      name: 'Dashboard Viewer',
      role: 'viewer',
      status: 'active'
    });

    console.log('Created users:', { admin: admin.email, analyst: analyst.email, viewer: viewer.email });

    const records = [
      { user: admin._id, amount: 8000, type: 'income', category: 'Salary', date: new Date('2024-01-15'), notes: 'January salary' },
      { user: admin._id, amount: 1500, type: 'expense', category: 'Rent', date: new Date('2024-01-01'), notes: 'Monthly rent' },
      { user: admin._id, amount: 200, type: 'expense', category: 'Utilities', date: new Date('2024-01-10'), notes: 'Electricity bill' },
      { user: admin._id, amount: 3500, type: 'income', category: 'Freelance', date: new Date('2024-01-20'), notes: 'Project payment' },
      { user: admin._id, amount: 150, type: 'expense', category: 'Groceries', date: new Date('2024-01-25'), notes: 'Weekly groceries' },
      { user: admin._id, amount: 500, type: 'expense', category: 'Entertainment', date: new Date('2024-02-05'), notes: 'Concert tickets' },
      { user: admin._id, amount: 8500, type: 'income', category: 'Salary', date: new Date('2024-02-15'), notes: 'February salary' },
      { user: admin._id, amount: 1500, type: 'expense', category: 'Rent', date: new Date('2024-02-01'), notes: 'Monthly rent' },
      { user: admin._id, amount: 3000, type: 'income', category: 'Investment', date: new Date('2024-02-20'), notes: 'Dividend payment' },
      { user: admin._id, amount: 100, type: 'expense', category: 'Healthcare', date: new Date('2024-02-28'), notes: 'Pharmacy' }
    ];

    await FinancialRecord.insertMany(records);
    console.log('Created financial records');

    console.log('\nSeed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@finance.com / admin123');
    console.log('Analyst: analyst@finance.com / analyst123');
    console.log('Viewer: viewer@finance.com / viewer123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
