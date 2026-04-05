const userService = require('../services/userService');
const { PERMISSIONS } = require('../config/constants');

class UserController {
  async register(req, res, next) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await userService.login(req.body.email, req.body.password);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const result = await userService.getAllUsers(req.query);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserProfile(req.user._id);
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const result = await userService.changePassword(
        req.user._id,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.json({
        success: true,
        message: result.message,
        data: { token: result.token }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
