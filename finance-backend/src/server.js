require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use('/api/v1', apiLimiter);

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/summary', summaryRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
