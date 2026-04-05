const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');
const { protect, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { summaryQuerySchema } = require('../validators/summaryValidator');
const { PERMISSIONS } = require('../config/constants');

router.use(protect);
router.use(requirePermission(PERMISSIONS.READ_SUMMARY));

router.get('/dashboard', validate(summaryQuerySchema), summaryController.getDashboardSummary);
router.get('/monthly-comparison', summaryController.getMonthlyComparison);
router.get('/top-categories', summaryController.getTopCategories);

module.exports = router;
