const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { protect, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRecordSchema, updateRecordSchema, queryRecordSchema } = require('../validators/recordValidator');
const { PERMISSIONS } = require('../config/constants');

router.use(protect);

router.get('/', validate(queryRecordSchema), recordController.getAll);
router.get('/categories', recordController.getCategories);
router.get('/:id', recordController.getById);

router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_RECORDS),
  validate(createRecordSchema),
  recordController.create
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.UPDATE_RECORDS),
  validate(updateRecordSchema),
  recordController.update
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.DELETE_RECORDS),
  recordController.delete
);

module.exports = router;
