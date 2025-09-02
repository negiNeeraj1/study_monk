const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  users: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    returning: { type: Number, default: 0 }
  },
  materials: {
    total: { type: Number, default: 0 },
    uploaded: { type: Number, default: 0 },
    downloaded: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  quizzes: {
    total: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 }
  },
  engagement: {
    sessionDuration: { type: Number, default: 0 }, // in minutes
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }
  },
  performance: {
    avgResponseTime: { type: Number, default: 0 }, // in ms
    errorRate: { type: Number, default: 0 },
    uptime: { type: Number, default: 100 }
  },
  revenue: {
    total: { type: Number, default: 0 },
    subscriptions: { type: Number, default: 0 },
    oneTime: { type: Number, default: 0 }
  },
  categories: [{
    name: String,
    users: { type: Number, default: 0 },
    materials: { type: Number, default: 0 },
    quizzes: { type: Number, default: 0 }
  }],
  topContent: [{
    id: mongoose.Schema.ObjectId,
    type: { type: String, enum: ['material', 'quiz'] },
    title: String,
    views: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient querying
analyticsSchema.index({ date: 1, type: 1 });
analyticsSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
