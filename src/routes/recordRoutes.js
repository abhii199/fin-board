import { Router } from 'express';
import {
  createRecord,
  deleteRecord,
  getRecordById,
  getRecords,
  updateRecord
} from '../controllers/recordController.js';
import { authMiddleware, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize('analyst', 'admin'), getRecords);
router.get('/:id', authorize('analyst', 'admin'), getRecordById);

router.post('/', authorize('admin'), createRecord);
router.patch('/:id', authorize('admin'), updateRecord);
router.delete('/:id', authorize('admin'), deleteRecord);

export default router;
