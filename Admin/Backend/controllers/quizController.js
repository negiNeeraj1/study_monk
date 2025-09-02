const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const SystemLog = require("../models/SystemLog");

// Get all quizzes with pagination and filters
exports.getQuizzes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      difficulty = "",
      published = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty;
    }

    if (published !== "") {
      query.isPublished = published === "true";
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [quizzes, totalQuizzes] = await Promise.all([
      Quiz.find(query)
        .populate("createdBy", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Quiz.countDocuments(query),
    ]);

    // Add attempt statistics for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const [attemptCount, avgScore] = await Promise.all([
          QuizAttempt.countDocuments({ quiz: quiz._id }),
          QuizAttempt.aggregate([
            { $match: { quiz: quiz._id } },
            { $group: { _id: null, avgScore: { $avg: "$score" } } },
          ]),
        ]);

        return {
          ...quiz,
          stats: {
            attempts: attemptCount,
            averageScore:
              avgScore.length > 0 ? Math.round(avgScore[0].avgScore) : 0,
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        quizzes: quizzesWithStats,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalQuizzes / parseInt(limit)),
          count: totalQuizzes,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Get quiz statistics
    const [attempts, recentAttempts, performanceStats] = await Promise.all([
      QuizAttempt.countDocuments({ quiz: id }),
      QuizAttempt.find({ quiz: id })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("user score passed timeTaken createdAt"),
      QuizAttempt.aggregate([
        { $match: { quiz: quiz._id } },
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$score" },
            passRate: { $avg: { $cond: [{ $eq: ["$passed", true] }, 1, 0] } },
            averageTime: { $avg: "$timeTaken" },
          },
        },
      ]),
    ]);

    const stats = performanceStats[0] || {
      averageScore: 0,
      passRate: 0,
      averageTime: 0,
    };

    res.json({
      success: true,
      data: {
        ...quiz,
        stats: {
          totalAttempts: attempts,
          averageScore: Math.round(stats.averageScore || 0),
          passRate: Math.round((stats.passRate || 0) * 100),
          averageTime: Math.round(stats.averageTime || 0),
        },
        recentAttempts,
      },
    });
  } catch (error) {
    console.error("Get quiz by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz details",
    });
  }
};

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      questions,
      timeLimit,
      passingScore,
      tags,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !questions ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and questions are required",
      });
    }

    // Validate questions
    for (const question of questions) {
      if (
        !question.question ||
        !question.options ||
        question.options.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Each question must have text and at least 2 options",
        });
      }

      const correctOptions = question.options.filter((opt) => opt.isCorrect);
      if (correctOptions.length !== 1) {
        return res.status(400).json({
          success: false,
          message: "Each question must have exactly one correct answer",
        });
      }
    }

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      questions,
      timeLimit,
      passingScore,
      tags,
      createdBy: req.user.id,
    });

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Quiz "${title}" created by admin`,
      module: "quiz-management",
      action: "create-quiz",
      userId: req.user.id,
      metadata: { quizId: quiz._id, category, difficulty },
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz created successfully",
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
    });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if quiz exists
    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Validate questions if provided
    if (updateData.questions) {
      for (const question of updateData.questions) {
        if (
          !question.question ||
          !question.options ||
          question.options.length < 2
        ) {
          return res.status(400).json({
            success: false,
            message: "Each question must have text and at least 2 options",
          });
        }

        const correctOptions = question.options.filter((opt) => opt.isCorrect);
        if (correctOptions.length !== 1) {
          return res.status(400).json({
            success: false,
            message: "Each question must have exactly one correct answer",
          });
        }
      }
    }

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Quiz "${updatedQuiz.title}" updated by admin`,
      module: "quiz-management",
      action: "update-quiz",
      userId: req.user.id,
      metadata: { quizId: id, changes: Object.keys(updateData) },
    });

    res.json({
      success: true,
      data: updatedQuiz,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quiz",
    });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if quiz exists
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Delete related quiz attempts
    await QuizAttempt.deleteMany({ quiz: id });

    // Delete quiz
    await Quiz.findByIdAndDelete(id);

    // Log the action
    await SystemLog.create({
      level: "warn",
      message: `Quiz "${quiz.title}" deleted by admin`,
      module: "quiz-management",
      action: "delete-quiz",
      userId: req.user.id,
      metadata: { deletedQuizId: id, quizTitle: quiz.title },
    });

    res.json({
      success: true,
      message: "Quiz and related attempts deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
    });
  }
};

// Publish/unpublish quiz
exports.toggleQuizPublication = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Toggle publication status
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Quiz "${quiz.title}" ${
        quiz.isPublished ? "published" : "unpublished"
      } by admin`,
      module: "quiz-management",
      action: "toggle-quiz-publication",
      userId: req.user.id,
      metadata: { quizId: id, published: quiz.isPublished },
    });

    res.json({
      success: true,
      data: { isPublished: quiz.isPublished },
      message: `Quiz ${
        quiz.isPublished ? "published" : "unpublished"
      } successfully`,
    });
  } catch (error) {
    console.error("Toggle quiz publication error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quiz publication status",
    });
  }
};

// Get quiz attempts with analytics
exports.getQuizAttempts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      quizId = "",
      userId = "",
      startDate,
      endDate,
      passed = "",
    } = req.query;

    // Build query
    let query = {};

    if (quizId) {
      query.quiz = quizId;
    }

    if (userId) {
      query.user = userId;
    }

    if (passed !== "") {
      query.passed = passed === "true";
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [attempts, totalAttempts] = await Promise.all([
      QuizAttempt.find(query)
        .populate("user", "name email")
        .populate("quiz", "title category difficulty")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      QuizAttempt.countDocuments(query),
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
    console.error("Get quiz attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz attempts",
    });
  }
};

// Get quiz statistics
exports.getQuizStats = async (req, res) => {
  try {
    const [
      totalQuizzes,
      publishedQuizzes,
      totalAttempts,
      avgScore,
      quizzesByCategory,
      topPerforming,
    ] = await Promise.all([
      Quiz.countDocuments(),
      Quiz.countDocuments({ isPublished: true }),
      QuizAttempt.countDocuments(),
      QuizAttempt.aggregate([
        { $group: { _id: null, avgScore: { $avg: "$score" } } },
      ]),
      Quiz.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Quiz.aggregate([
        {
          $lookup: {
            from: "quizattempts",
            localField: "_id",
            foreignField: "quiz",
            as: "attempts",
          },
        },
        {
          $addFields: {
            attemptCount: { $size: "$attempts" },
            avgScore: { $avg: "$attempts.score" },
          },
        },
        { $sort: { attemptCount: -1 } },
        { $limit: 5 },
        {
          $project: {
            title: 1,
            category: 1,
            attemptCount: 1,
            avgScore: { $round: ["$avgScore", 1] },
          },
        },
      ]),
    ]);

    const averageScore = avgScore.length > 0 ? avgScore[0].avgScore : 0;

    res.json({
      success: true,
      data: {
        total: totalQuizzes,
        published: publishedQuizzes,
        totalAttempts,
        averageScore: Math.round(averageScore || 0),
        byCategory: quizzesByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topPerforming,
      },
    });
  } catch (error) {
    console.error("Get quiz stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz statistics",
    });
  }
};
