const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  createQuizAttempt,
  getUserQuizHistory,
  getQuizAttemptById,
  getUserDashboardStats,
  deleteQuizAttempt,
} = require("../controllers/quizAttemptController");

// All routes require authentication
router.use(auth);

// POST /api/quiz-attempts - Create a new quiz attempt
router.post("/", createQuizAttempt);

// GET /api/quiz-attempts - Get user's quiz history with pagination and filters
router.get("/", getUserQuizHistory);

// GET /api/quiz-attempts/dashboard-stats - Get dashboard statistics
router.get("/dashboard-stats", getUserDashboardStats);

// GET /api/quiz-attempts/:attemptId - Get detailed quiz attempt by ID
router.get("/:attemptId", getQuizAttemptById);

// DELETE /api/quiz-attempts/:attemptId - Delete a quiz attempt
router.delete("/:attemptId", deleteQuizAttempt);

module.exports = router;
