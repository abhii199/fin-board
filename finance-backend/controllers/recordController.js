const recordService = require('../services/recordService');
const { PERMISSIONS } = require('../config/constants');

class RecordController {
  async create(req, res, next) {
    try {
      const record = await recordService.create(req.body, req.user._id);
      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: { record }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await recordService.getAll(req.user._id, req.query);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const record = await recordService.getById(req.params.id, req.user._id);
      res.json({
        success: true,
        data: { record }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const record = await recordService.update(req.params.id, req.user._id, req.body);
      res.json({
        success: true,
        message: 'Record updated successfully',
        data: { record }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await recordService.delete(req.params.id, req.user._id);
      res.json({
        success: true,
        message: 'Record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await recordService.getCategories(req.user._id);
      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecordController();
