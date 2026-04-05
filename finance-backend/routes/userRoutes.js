const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updateUserSchema, changePasswordSchema } = require('../validators/userValidator');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', loginLimiter, validate(loginSchema), userController.login);
router.get('/profile', protect, userController.getProfile);
router.put('/change-password', protect, validate(changePasswordSchema), userController.changePassword);

router.use(protect);
router.use(authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
