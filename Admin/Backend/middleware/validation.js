const { body, param, query, validationResult } = require("express-validator");

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

// User validation rules
exports.validateUser = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
];

// Quiz validation rules
exports.validateQuiz = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("category")
    .isIn(["ai-ml", "web-dev", "dsa", "programming", "database", "other"])
    .withMessage("Invalid category"),

  body("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Difficulty must be beginner, intermediate, or advanced"),

  body("questions")
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),

  body("questions.*.question")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Each question must be at least 5 characters long"),

  body("questions.*.options")
    .isArray({ min: 2, max: 6 })
    .withMessage("Each question must have between 2 and 6 options"),

  body("timeLimit")
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage("Time limit must be between 1 and 300 minutes"),

  body("passingScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Passing score must be between 0 and 100"),
];

// Notification validation rules
exports.validateNotification = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("message")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Message must be between 10 and 500 characters"),

  body("type")
    .optional()
    .isIn(["info", "success", "warning", "error", "announcement"])
    .withMessage("Invalid notification type"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority level"),

  body("recipients")
    .isIn(["all", "students", "admins", "specific"])
    .withMessage("Invalid recipients option"),

  body("specificUsers")
    .if(body("recipients").equals("specific"))
    .isArray({ min: 1 })
    .withMessage(
      "Specific users are required when recipients is set to specific"
    ),

  body("scheduledFor")
    .optional()
    .isISO8601()
    .withMessage("Invalid scheduled date format"),

  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("Invalid expiration date format"),
];

// Study Material validation rules
exports.validateStudyMaterial = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("content")
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Content must not exceed 10000 characters"),

  body("type")
    .isIn(["note", "pdf", "video", "link"])
    .withMessage("Type must be note, pdf, video, or link"),

  body("subject")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Subject must be between 2 and 50 characters"),

  body("difficulty")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Difficulty must be beginner, intermediate, or advanced"),

  body("tags")
    .optional()
    .isString()
    .withMessage("Tags must be a comma-separated string"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  body("isPremium")
    .optional()
    .isBoolean()
    .withMessage("isPremium must be a boolean"),

  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),
];

// Pagination validation
exports.validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

// MongoDB ObjectId validation
exports.validateObjectId = (paramName = "id") => [
  param(paramName).isMongoId().withMessage("Invalid ID format"),
];

// Date range validation
exports.validateDateRange = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format"),

  query("endDate")
    .optional()
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        if (end <= start) {
          throw new Error("End date must be after start date");
        }
      }
      return true;
    }),
];

// Search validation
exports.validateSearch = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query cannot exceed 100 characters"),
];

// File upload validation
exports.validateFileUpload = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("category")
    .optional()
    .isIn(["ai-ml", "web-dev", "dsa", "programming", "database", "other"])
    .withMessage("Invalid category"),
];

// Settings validation
exports.validateSettings = [
  body("key")
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Key must contain only alphanumeric characters, dots, hyphens, and underscores"
    ),

  body("value").exists().withMessage("Value is required"),

  body("type")
    .isIn(["string", "number", "boolean", "object", "array"])
    .withMessage("Invalid value type"),

  body("category")
    .isIn(["general", "email", "security", "ui", "api", "storage", "analytics"])
    .withMessage("Invalid category"),
];

// Custom validation for quiz questions
exports.validateQuizQuestions = (req, res, next) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({
      success: false,
      message: "Questions must be an array",
    });
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    // Check if question has required fields
    if (!question.question || !question.options) {
      return res.status(400).json({
        success: false,
        message: `Question ${i + 1}: Missing question text or options`,
      });
    }

    // Check if options is an array with at least 2 items
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return res.status(400).json({
        success: false,
        message: `Question ${i + 1}: Must have at least 2 options`,
      });
    }

    // Check if exactly one option is marked as correct
    const correctOptions = question.options.filter((opt) => opt.isCorrect);
    if (correctOptions.length !== 1) {
      return res.status(400).json({
        success: false,
        message: `Question ${i + 1}: Must have exactly one correct answer`,
      });
    }

    // Validate option text
    for (let j = 0; j < question.options.length; j++) {
      const option = question.options[j];
      if (!option.text || option.text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}, Option ${
            j + 1
          }: Option text is required`,
        });
      }
    }
  }

  next();
};
