const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      name: { type: String, required: true },
      id: { type: Number, required: true },
    },
    difficulty: {
      id: {
        type: String,
        required: true,
        enum: ["beginner", "intermediate", "advanced"],
      },
      name: { type: String, required: true },
      passingScore: { type: Number, required: true },
    },
    questionCount: {
      value: { type: Number, required: true },
      label: { type: String, required: true },
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [
          {
            text: { type: String, required: true },
            correct: { type: Boolean, required: true },
          },
        ],
        userAnswer: {
          text: { type: String },
          correct: { type: Boolean },
          selectedIndex: { type: Number },
        },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    score: {
      correct: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true },
      percentage: { type: Number, required: true },
    },
    timeTaken: { type: Number, required: true }, // in minutes
    passed: { type: Boolean, required: true },
    completedAt: { type: Date, default: Date.now },
    // Analytics fields
    timePerQuestion: { type: Number }, // average time per question in seconds
    difficultyRating: { type: Number, min: 1, max: 5 }, // user can rate difficulty
    feedback: { type: String }, // optional user feedback
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { userId: 1, completedAt: -1 },
      { "subject.name": 1 },
      { "difficulty.id": 1 },
      { passed: 1 },
    ],
  }
);

// Virtual for getting subject difficulty combination
quizAttemptSchema.virtual("subjectDifficulty").get(function () {
  return `${this.subject.name} - ${this.difficulty.name}`;
});

// Static method to get user stats
quizAttemptSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        totalPassed: { $sum: { $cond: ["$passed", 1, 0] } },
        averageScore: { $avg: "$score.percentage" },
        totalTimeTaken: { $sum: "$timeTaken" },
        bestScore: { $max: "$score.percentage" },
        recentAttempts: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        totalAttempts: 1,
        totalPassed: 1,
        passRate: {
          $round: [
            {
              $multiply: [{ $divide: ["$totalPassed", "$totalAttempts"] }, 100],
            },
            1,
          ],
        },
        averageScore: { $round: ["$averageScore", 1] },
        totalTimeTaken: 1,
        bestScore: 1,
        recentAttempts: { $slice: [{ $reverseArray: "$recentAttempts" }, 5] },
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : {
        totalAttempts: 0,
        totalPassed: 0,
        passRate: 0,
        averageScore: 0,
        totalTimeTaken: 0,
        bestScore: 0,
        recentAttempts: [],
      };
};

// Static method to get subject-wise performance
quizAttemptSchema.statics.getSubjectPerformance = async function (userId) {
  return await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$subject.name",
        attempts: { $sum: 1 },
        passed: { $sum: { $cond: ["$passed", 1, 0] } },
        averageScore: { $avg: "$score.percentage" },
        bestScore: { $max: "$score.percentage" },
        lastAttempt: { $max: "$completedAt" },
      },
    },
    {
      $project: {
        subject: "$_id",
        attempts: 1,
        passed: 1,
        passRate: {
          $round: [
            { $multiply: [{ $divide: ["$passed", "$attempts"] }, 100] },
            1,
          ],
        },
        averageScore: { $round: ["$averageScore", 1] },
        bestScore: 1,
        lastAttempt: 1,
      },
    },
    { $sort: { lastAttempt: -1 } },
  ]);
};

// Instance method to calculate performance insights
quizAttemptSchema.methods.getPerformanceInsights = function () {
  const insights = [];

  if (this.score.percentage >= 90) {
    insights.push("🌟 Excellent performance!");
  } else if (this.score.percentage >= 75) {
    insights.push("👏 Great job!");
  } else if (this.score.percentage >= this.difficulty.passingScore) {
    insights.push("✅ Good work, you passed!");
  } else {
    insights.push("📚 Keep studying, you'll get it next time!");
  }

  if (this.timeTaken < this.questions.length * 1.5) {
    insights.push("⚡ Fast completion time!");
  }

  if (this.difficulty.id === "advanced" && this.passed) {
    insights.push("🚀 Advanced level mastery!");
  }

  return insights;
};

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
