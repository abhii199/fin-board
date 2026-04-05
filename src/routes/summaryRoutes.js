import { Router } from 'express';
import {
  getDashboardSummary,
  getMonthlyTrends
} from '../controllers/summaryController.js';
import { authMiddleware, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/dashboard', authorize('viewer', 'analyst', 'admin'), getDashboardSummary);
router.get('/trends', authorize('viewer', 'analyst', 'admin'), getMonthlyTrends);

export default router;
