import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './utils/db.js';
import { apiLimiter } from './middlewares/rateLimmiter.js';


import userRoutes from './routes/userRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiLimiter);

app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/summary', summaryRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});

export default app;
