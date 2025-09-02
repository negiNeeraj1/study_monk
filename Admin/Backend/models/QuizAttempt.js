const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.ObjectId,
      required: true
    },
    selectedOption: {
      type: Number, // index of selected option
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in minutes
    required: true
  },
  timeLimit: {
    type: Number, // in minutes
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for user and quiz
quizAttemptSchema.index({ user: 1, quiz: 1 });

// Index for quiz performance analytics
quizAttemptSchema.index({ quiz: 1, score: 1, createdAt: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
