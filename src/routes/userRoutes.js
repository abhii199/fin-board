import { Router } from 'express';
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getProfile,
  getUserById,
  login,
  register,
  updateUser
} from '../controllers/userController.js';
import { authMiddleware, authorize } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimmiter.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);

router.get('/profile', authMiddleware, getProfile);
router.patch('/change-password', authMiddleware, changePassword);

router.get('/users', authMiddleware, authorize('admin'), getAllUsers);
router.get('/users/:id', authMiddleware, authorize('admin'), getUserById);
router.patch('/users/:id', authMiddleware, authorize('admin'), updateUser);
router.delete('/users/:id', authMiddleware, authorize('admin'), deleteUser);

export default router;
