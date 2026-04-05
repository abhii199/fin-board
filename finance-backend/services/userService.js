const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

class UserService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);
    
    return { user, token };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Account is inactive. Please contact administrator', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    return { user, token };
  }

  async getAllUsers(query) {
    const { page = 1, limit = 10, role, status, search } = query;
    
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(id, updateData) {
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);
    return { message: 'Password changed successfully', token };
  }
}

module.exports = new UserService();
