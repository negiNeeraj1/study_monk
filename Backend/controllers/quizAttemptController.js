const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");

// Create a new quiz attempt
exports.createQuizAttempt = async (req, res) => {
  try {
    const {
      subject,
      difficulty,
      questionCount,
      questions,
      score,
      timeTaken,
      userAnswers,
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (
      !subject ||
      !difficulty ||
      !questionCount ||
      !questions ||
      !score ||
      timeTaken === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields for quiz attempt",
      });
    }

    // Process questions with user answers
    const processedQuestions = questions.map((question, index) => {
      const userAnswer = userAnswers && userAnswers[index];
      const correctOption = question.options.find((opt) => opt.correct);

      return {
        question: question.text,
        options: question.options,
        userAnswer: userAnswer
          ? {
              text: userAnswer.selectedOption?.text || "",
              correct: userAnswer.isCorrect || false,
              // Compare by text to avoid reference inequality across JSON boundaries
              selectedIndex: question.options.findIndex(
                (opt) => opt?.text === userAnswer.selectedOption?.text
              ),
            }
          : null,
        isCorrect: userAnswer?.isCorrect || false,
      };
    });

    // Calculate if passed
    const passed = score.percentage >= difficulty.passingScore;

    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      userId,
      subject,
      difficulty,
      questionCount,
      questions: processedQuestions,
      score,
      timeTaken,
      passed,
      timePerQuestion: (timeTaken * 60) / questions.length, // convert to seconds per question
    });

    await quizAttempt.save();

    // Update user statistics
    await updateUserStats(userId);

    res.status(201).json({
      success: true,
      message: "Quiz attempt saved successfully",
      data: {
        attemptId: quizAttempt._id,
        score: quizAttempt.score,
        passed: quizAttempt.passed,
        insights: quizAttempt.getPerformanceInsights(),
      },
    });
  } catch (error) {
    console.error("Error creating quiz attempt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save quiz attempt",
    });
  }
};

// Get user's quiz history
exports.getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, subject, difficulty, passed } = req.query;

    // Build filter
    const filter = { userId };
    if (subject) filter["subject.name"] = subject;
    if (difficulty) filter["difficulty.id"] = difficulty;
    if (passed !== undefined) filter.passed = passed === "true";

    const skip = (page - 1) * limit;

    // Get quiz attempts with pagination
    const attempts = await QuizAttempt.find(filter)
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-questions.options -questions.userAnswer") // Exclude detailed answers for list view
      .lean();

    const totalAttempts = await QuizAttempt.countDocuments(filter);

    // Add performance insights to each attempt
    const attemptsWithInsights = attempts.map((attempt) => ({
      ...attempt,
      insights: getPerformanceInsights(attempt),
    }));

    res.json({
      success: true,
      data: {
        attempts: attemptsWithInsights,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAttempts / limit),
          totalAttempts,
          hasNext: skip + attempts.length < totalAttempts,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch quiz history",
    });
  }
};

// Get detailed quiz attempt by ID
exports.getQuizAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId,
    }).lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: "Quiz attempt not found",
      });
    }

    // Add performance insights
    attempt.insights = getPerformanceInsights(attempt);

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch quiz attempt",
    });
  }
};

// Get user dashboard statistics
exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get overall stats using the static method
    const overallStats = await QuizAttempt.getUserStats(userId);

    // Get subject-wise performance
    const subjectPerformance = await QuizAttempt.getSubjectPerformance(userId);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await QuizAttempt.find({
      userId,
      completedAt: { $gte: sevenDaysAgo },
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .lean();

    // Get difficulty breakdown
    const difficultyBreakdown = await QuizAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$difficulty.id",
          name: { $first: "$difficulty.name" },
          attempts: { $sum: 1 },
          passed: { $sum: { $cond: ["$passed", 1, 0] } },
          averageScore: { $avg: "$score.percentage" },
        },
      },
      {
        $project: {
          difficulty: "$_id",
          name: 1,
          attempts: 1,
          passed: 1,
          passRate: {
            $round: [
              { $multiply: [{ $divide: ["$passed", "$attempts"] }, 100] },
              1,
            ],
          },
          averageScore: { $round: ["$averageScore", 1] },
        },
      },
    ]);

    // Calculate streak (consecutive days with quiz activity)
    const streak = await calculateLearningStreak(userId);

    res.json({
      success: true,
      data: {
        overview: overallStats,
        subjectPerformance,
        difficultyBreakdown,
        recentActivity,
        learningStreak: streak,
        lastActive: overallStats.recentAttempts[0]?.completedAt || null,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard statistics",
    });
  }
};

// Delete a quiz attempt
exports.deleteQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await QuizAttempt.findOneAndDelete({
      _id: attemptId,
      userId,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: "Quiz attempt not found",
      });
    }

    // Update user statistics after deletion
    await updateUserStats(userId);

    res.json({
      success: true,
      message: "Quiz attempt deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz attempt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete quiz attempt",
    });
  }
};

// Helper function to update user statistics
const updateUserStats = async (userId) => {
  try {
    const stats = await QuizAttempt.getUserStats(userId);

    await User.findByIdAndUpdate(userId, {
      totalQuizzes: stats.totalAttempts,
      averageScore: stats.averageScore,
      lastActive: new Date(),
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
};

// Helper function to get performance insights (for non-schema instances)
const getPerformanceInsights = (attempt) => {
  const insights = [];

  if (attempt.score.percentage >= 90) {
    insights.push("🌟 Excellent performance!");
  } else if (attempt.score.percentage >= 75) {
    insights.push("👏 Great job!");
  } else if (attempt.score.percentage >= attempt.difficulty.passingScore) {
    insights.push("✅ Good work, you passed!");
  } else {
    insights.push("📚 Keep studying, you'll get it next time!");
  }

  if (attempt.timeTaken < attempt.questions.length * 1.5) {
    insights.push("⚡ Fast completion time!");
  }

  if (attempt.difficulty.id === "advanced" && attempt.passed) {
    insights.push("🚀 Advanced level mastery!");
  }

  return insights;
};

// Helper function to calculate learning streak
const calculateLearningStreak = async (userId) => {
  try {
    // Get all quiz attempts, sorted by date (most recent first)
    const attempts = await QuizAttempt.find({ userId })
      .sort({ completedAt: -1 })
      .select("completedAt")
      .lean();

    if (attempts.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset to start of day

    for (const attempt of attempts) {
      const attemptDate = new Date(attempt.completedAt);
      attemptDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate - attemptDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(attemptDate);
      } else if (daysDiff === streak + 1) {
        // Gap of one day, continue
        streak++;
        currentDate = new Date(attemptDate);
      } else {
        // Gap too big, break the streak
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating learning streak:", error);
    return 0;
  }
};
