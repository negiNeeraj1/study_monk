const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Controllers
const studyMaterialController = require("../controllers/studyMaterialController");

// Middleware
const { adminAuth } = require("../middleware/adminAuth");
const {
  validateStudyMaterial,
  validatePagination,
  validateSearch,
  validateObjectId,
  handleValidationErrors,
} = require("../middleware/validation");
const {
  adminRateLimit,
  sensitiveOperationsLimit,
} = require("../middleware/security");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/study-materials");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Expanded types to align with frontend accepted list
  const allowedTypes = new Set([
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Video
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
  ]);

  if (allowedTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  // Fallback: allow based on file extension if mimetype is missing/inexact
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".mp4",
    ".webm",
    ".ogg",
    ".avi",
    ".mp3",
    ".wav",
  ]);

  if (allowedExtensions.has(ext)) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Invalid file type. Allowed: PDF, DOC/DOCX, PPT/PPTX, TXT, CSV, images (JPG/PNG/GIF/WebP), videos (MP4/WebM/OGG/AVI), audio (MP3/WAV)."
    ),
    false
  );
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Apply admin authentication and rate limiting to all routes
router.use(adminAuth);
router.use(adminRateLimit);

// Admin Study Material Management Routes

// Get all study materials with pagination and filters
router.get(
  "/",
  validatePagination,
  validateSearch,
  handleValidationErrors,
  studyMaterialController.getAllMaterials
);

// Get study material statistics
router.get("/stats", studyMaterialController.getStudyMaterialStats);

// Get study material by ID
router.get(
  "/:id",
  validateObjectId("id"),
  handleValidationErrors,
  studyMaterialController.getMaterialById
);

// Create new study material (with file upload)
router.post(
  "/",
  sensitiveOperationsLimit,
  upload.single("file"),
  validateStudyMaterial,
  handleValidationErrors,
  studyMaterialController.createMaterial
);

// Update study material
router.put(
  "/:id",
  sensitiveOperationsLimit,
  upload.single("file"),
  validateObjectId("id"),
  validateStudyMaterial,
  handleValidationErrors,
  studyMaterialController.updateMaterial
);

// Delete study material
router.delete(
  "/:id",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  handleValidationErrors,
  studyMaterialController.deleteMaterial
);

// Toggle publication status
router.patch(
  "/:id/toggle-publication",
  sensitiveOperationsLimit,
  validateObjectId("id"),
  handleValidationErrors,
  studyMaterialController.togglePublication
);

// Bulk operations
router.post(
  "/bulk-publish",
  sensitiveOperationsLimit,
  studyMaterialController.bulkPublish
);

router.post(
  "/bulk-delete",
  sensitiveOperationsLimit,
  studyMaterialController.bulkDelete
);

// File management
router.get(
  "/:id/download",
  validateObjectId("id"),
  handleValidationErrors,
  studyMaterialController.downloadMaterial
);

router.get(
  "/:id/preview",
  validateObjectId("id"),
  handleValidationErrors,
  studyMaterialController.previewMaterial
);

// Category management
router.get("/categories/all", studyMaterialController.getAllCategories);
router.get("/categories/stats", studyMaterialController.getCategoryStats);

module.exports = router;
