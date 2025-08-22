const express = require('express');
const router = express.Router();
const { 
  getAllMaterials,
  getMaterialsByCategory,
  getMaterialById,
  downloadMaterial,
  uploadMaterial,
  deleteMaterial,
  updateMaterial
} = require('../controllers/studyMaterialController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllMaterials);
router.get('/category/:category', getMaterialsByCategory);
router.get('/:id', getMaterialById);
router.get('/:id/download', downloadMaterial);

// Protected routes (admin only)
router.post('/', protect, uploadMaterial);
router.delete('/:id', protect, deleteMaterial);
router.put('/:id', protect, updateMaterial);

module.exports = router;