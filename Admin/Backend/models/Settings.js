const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: mongoose.Schema.Types.Mixed,
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'email', 'security', 'ui', 'api', 'storage', 'analytics'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  validation: {
    required: Boolean,
    min: mongoose.Schema.Types.Mixed,
    max: mongoose.Schema.Types.Mixed,
    pattern: String,
    enum: [mongoose.Schema.Types.Mixed]
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient querying
settingsSchema.index({ category: 1, key: 1 });
settingsSchema.index({ isPublic: 1 });

// Static method to get setting by key
settingsSchema.statics.getSetting = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting
settingsSchema.statics.setSetting = async function(key, value, updatedBy) {
  return await this.findOneAndUpdate(
    { key },
    { value, updatedBy },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Settings', settingsSchema);
