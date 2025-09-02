const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['user-activity', 'quiz-performance', 'material-usage', 'system-health', 'custom'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf'
  },
  schedule: {
    type: String,
    enum: ['manual', 'daily', 'weekly', 'monthly', 'quarterly'],
    default: 'manual'
  },
  parameters: {
    dateRange: {
      start: Date,
      end: Date
    },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    categories: [String],
    filters: mongoose.Schema.Types.Mixed
  },
  data: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  fileUrl: String,
  fileSize: Number, // in bytes
  generatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: Date,
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloaded: Date,
  expiresAt: Date,
  isScheduled: {
    type: Boolean,
    default: false
  },
  nextRun: Date,
  recipients: [{
    email: String,
    name: String
  }],
  error: {
    message: String,
    code: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
reportSchema.index({ type: 1, status: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ schedule: 1, nextRun: 1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Report', reportSchema);
