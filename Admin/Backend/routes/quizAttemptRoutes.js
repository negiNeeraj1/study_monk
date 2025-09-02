const express = require("express");
const router = express.Router();
const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");
// const User = require("../../Backend/models/User"); // Not needed for this route
const { optionalAdmin } = require("../middleware/adminAuth");
const {
  validateObjectId,
  handleValidationErrors,
} = require("../middleware/validation");
const SystemLog = require("../models/SystemLog");

// Apply optional admin authentication (allows both users and admins)
router.use(optionalAdmin);

// Submit quiz attempt (for students)
router.post("/", async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get quiz details
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Quiz is not available",
      });
    }

    // Calculate score
    let totalPoints = 0;
    let maxPoints = 0;
    let correctAnswers = 0;

    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      if (!question) return answer;

      const questionPoints = question.points || 10;
      maxPoints += questionPoints;

      if (answer.isCorrect) {
        totalPoints += questionPoints;
        correctAnswers++;
      }

      return {
        ...answer,
        points: answer.isCorrect ? questionPoints : 0,
      };
    });

    const score = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;

    // Create quiz attempt
    const quizAttempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      answers: processedAnswers,
      score,
      totalPoints,
      maxPoints,
      timeTaken,
      timeLimit: quiz.timeLimit,
      passed,
      startedAt: new Date(Date.now() - timeTaken * 60 * 1000), // Calculate start time
      completedAt: new Date(),
      isCompleted: true,
    });

    // Update quiz statistics
    await Quiz.findByIdAndUpdate(quizId, {
      $inc: { totalAttempts: 1 },
    });

    // Log the attempt
    await SystemLog.create({
      level: "info",
      message: `Quiz attempt completed: ${quiz.title} by user ${req.user.email}`,
      module: "quiz-attempt",
      action: "complete-quiz",
      userId: userId,
      metadata: {
        quizId,
        score: Math.round(score),
        passed,
        timeTaken,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: quizAttempt._id,
        score: Math.round(score),
        totalPoints,
        maxPoints,
        timeTaken,
        passed,
        correctAnswers,
        totalQuestions: quiz.questions.length,
      },
      message: passed
        ? "Quiz completed successfully!"
        : "Quiz completed. Keep studying!",
    });
  } catch (error) {
    console.error("Submit quiz attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz attempt",
    });
  }
});

// Get user's quiz attempts
router.get(
  "/user/:userId",
  validateObjectId("userId"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Check if user can access these attempts
      if (req.user.id !== userId && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [attempts, totalAttempts] = await Promise.all([
        QuizAttempt.find({ user: userId })
          .populate("quiz", "title category difficulty timeLimit passingScore")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        QuizAttempt.countDocuments({ user: userId }),
      ]);

      res.json({
        success: true,
        data: {
          attempts,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(totalAttempts / parseInt(limit)),
            count: totalAttempts,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get user attempts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quiz attempts",
      });
    }
  }
);

module.exports = router;
