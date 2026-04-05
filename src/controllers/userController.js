import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(6),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1)
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

const register = async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      throw createError('Email is already registered', 409);
    }

    const user = await User.create(body);
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.flattenError(error).fieldErrors
      });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await User.findOne({ email: body.email });
    if (!user || !(await user.matchPassword(body.password))) {
      throw createError('Invalid email or password', 401);
    }

    if (user.status !== 'active') {
      throw createError('User account is inactive', 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.flattenError(error).fieldErrors
      });
    }
    next(error);
  }
};

const getAllUsers = async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { count: users.length, users }
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const body = updateUserSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.flattenError(error).fieldErrors
      });
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const body = changePasswordSchema.parse(req.body);

    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(body.currentPassword))) {
      throw createError('Current password is incorrect', 400);
    }

    user.password = body.newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.flattenError(error).fieldErrors
      });
    }
    next(error);
  }
};

export {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  changePassword
};
