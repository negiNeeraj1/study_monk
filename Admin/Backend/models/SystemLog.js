const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  module: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  ip: String,
  userAgent: String,
  requestData: mongoose.Schema.Types.Mixed,
  responseData: mongoose.Schema.Types.Mixed,
  executionTime: Number, // in milliseconds
  errorStack: String,
  metadata: mongoose.Schema.Types.Mixed,
  tags: [String]
}, {
  timestamps: true
});

// Indexes for efficient querying and log management
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ module: 1, action: 1, createdAt: -1 });
systemLogSchema.index({ userId: 1, createdAt: -1 });

// TTL index to automatically delete old logs (30 days)
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
