const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // Content is required only for note type
    content: {
      type: String,
      required: function () {
        return this.type === "note";
      },
    },
    type: {
      type: String,
      enum: ["note", "pdf", "video", "link"],
      default: "note",
    },
    subject: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    fileUrl: { type: String },
    fileSize: { type: Number },
    thumbnail: { type: String },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Index for better query performance
studyMaterialSchema.index({ subject: 1, difficulty: 1, isPublished: 1 });
studyMaterialSchema.index({ author: 1, status: 1 });
studyMaterialSchema.index({ tags: 1 });

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
