const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['ai-ml', 'web-dev', 'dsa', 'programming', 'database', 'other']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please add a file URL']
  },
  thumbnailUrl: {
    type: String,
    default: '/uploads/thumbnails/default-thumbnail.jpg'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);