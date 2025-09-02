const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Controllers
const publicStudyMaterialController = require("../controllers/publicStudyMaterialController");

// Middleware
const {
  validatePagination,
  validateSearch,
  validateObjectId,
  handleValidationErrors,
} = require("../middleware/validation");

// Public Study Material Routes (No authentication required)

// Get all published study materials
router.get(
  "/",
  validatePagination,
  validateSearch,
  handleValidationErrors,
  publicStudyMaterialController.getAllPublishedMaterials
);

// Get study materials by category
router.get(
  "/category/:category",
  validatePagination,
  handleValidationErrors,
  publicStudyMaterialController.getMaterialsByCategory
);

// Get study material by ID
router.get(
  "/:id",
  validateObjectId("id"),
  handleValidationErrors,
  publicStudyMaterialController.getMaterialById
);

// Download study material
router.get(
  "/:id/download",
  validateObjectId("id"),
  handleValidationErrors,
  publicStudyMaterialController.downloadMaterial
);

// Preview study material
router.get(
  "/:id/preview",
  validateObjectId("id"),
  handleValidationErrors,
  publicStudyMaterialController.previewMaterial
);

// Search study materials
router.get(
  "/search",
  validatePagination,
  validateSearch,
  handleValidationErrors,
  publicStudyMaterialController.searchMaterials
);

// Get popular materials
router.get("/popular", publicStudyMaterialController.getPopularMaterials);

// Get recent materials
router.get("/recent", publicStudyMaterialController.getRecentMaterials);

// Get materials by difficulty
router.get(
  "/difficulty/:difficulty",
  validatePagination,
  handleValidationErrors,
  publicStudyMaterialController.getMaterialsByDifficulty
);

// Get all available categories
router.get("/categories", publicStudyMaterialController.getAllCategories);

// Get materials by tags
router.get(
  "/tags/:tag",
  validatePagination,
  handleValidationErrors,
  publicStudyMaterialController.getMaterialsByTag
);

module.exports = router;
