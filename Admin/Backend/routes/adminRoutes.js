const express = require('express');
const router = express.Router();

// Controllers
const adminController = require('../controllers/adminController');

// Middleware
const { adminAuth, checkDBHealth } = require('../middleware/adminAuth');
const { validateDateRange, handleValidationErrors } = require('../middleware/validation');
const { adminRateLimit } = require('../middleware/security');

// Debug middleware to log all requests
const debugMiddleware = (req, res, next) => {
  console.log(`🔍 Admin route accessed: ${req.method} ${req.path}`);
  next();
};

// Apply debug middleware to all routes
router.use(debugMiddleware);

// Public admin login route (no auth required) - MUST be first
router.post('/login', checkDBHealth, (req, res, next) => {
  console.log('🔑 Admin login route accessed - no auth required');
  next();
}, adminController.adminLogin);

// Apply admin authentication and rate limiting to protected routes ONLY
router.use('/dashboard', adminAuth);
router.use('/analytics', adminAuth);
router.use('/system', adminAuth);

// Dashboard Routes
router.get('/dashboard/stats', 
  adminController.getDashboardStats
);

router.get('/analytics', 
  validateDateRange,
  handleValidationErrors,
  adminController.getAnalyticsData
);

router.get('/system/health',
  adminController.getSystemHealth
);

module.exports = router;
