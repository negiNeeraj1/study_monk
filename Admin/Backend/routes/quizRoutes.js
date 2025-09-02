const express = require("express");
const router = express.Router();

// Controllers
const quizController = require("../controllers/quizController");

// Middleware
const { adminAuth } = require("../middleware/adminAuth");
const {
  validateQuiz,
  validatePagination,
  validateDateRange,
  validateObjectId,
  handleValidationErrors,
} = require("../middleware/validation");
const {
  adminRateLimit,
  sensitiveOperationsLimit,
} = require("../middleware/security");

// Apply admin authentication and rate limiting to all routes
router.use(adminAuth);
router.use(adminRateLimit);

// Quiz Management Routes

// Get all quizzes with pagination and filters
router.get(
  "/",
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  quizController.getQuizzes
);

// Get quiz statistics
router.get(
  "/stats",
  validateDateRange,
  handleValidationErrors,
  quizController.getQuizStats
);

// Get quiz attempts
router.get(
  "/attempts",
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  quizController.getQuizAttempts
);

// Get quiz by ID
router.get(
  "/:id",
  validateObjectId("id"),
  handleValidationErrors,
  quizController.getQuizById
);

// Create new quiz
router.post(
  "/",
  sensitiveOperationsLimit,
  validateQuiz,
  handleValidationErrors,
  quizController.createQuiz
);

// Update quiz
router.put(
  "/:id",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  validateQuiz,
  handleValidationErrors,
  quizController.updateQuiz
);

// Toggle quiz publication status
router.patch(
  "/:id/toggle-publication",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  handleValidationErrors,
  quizController.toggleQuizPublication
);

// Delete quiz
router.delete(
  "/:id",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  handleValidationErrors,
  quizController.deleteQuiz
);

module.exports = router;
