const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const fs = require('fs');

// Create a mock database for study materials
// In a real application, this would be stored in a database
let studyMaterials = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'A comprehensive guide to machine learning fundamentals',
    category: 'ai-ml',
    fileUrl: '/uploads/study-materials/intro-to-ml.pdf',
    thumbnailUrl: '/uploads/thumbnails/ml-thumbnail.jpg',
    uploadDate: '2023-06-15',
    downloadCount: 120
  },
  {
    id: '2',
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of HTML, CSS, and JavaScript',
    category: 'web-dev',
    fileUrl: '/uploads/study-materials/web-dev-basics.pdf',
    thumbnailUrl: '/uploads/thumbnails/web-dev-thumbnail.jpg',
    uploadDate: '2023-07-20',
    downloadCount: 85
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms',
    description: 'Essential DSA concepts for programming interviews',
    category: 'dsa',
    fileUrl: '/uploads/study-materials/dsa-guide.pdf',
    thumbnailUrl: '/uploads/thumbnails/dsa-thumbnail.jpg',
    uploadDate: '2023-08-05',
    downloadCount: 150
  },
  {
    id: '4',
    title: 'Advanced Python Programming',
    description: 'Master advanced Python concepts and techniques',
    category: 'programming',
    fileUrl: '/uploads/study-materials/advanced-python.pdf',
    thumbnailUrl: '/uploads/thumbnails/python-thumbnail.jpg',
    uploadDate: '2023-09-10',
    downloadCount: 95
  },
  {
    id: '5',
    title: 'Database Design Principles',
    description: 'Learn how to design efficient and scalable databases',
    category: 'database',
    fileUrl: '/uploads/study-materials/database-design.pdf',
    thumbnailUrl: '/uploads/thumbnails/database-thumbnail.jpg',
    uploadDate: '2023-10-15',
    downloadCount: 70
  }
];

// Get all study materials
exports.getAllMaterials = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: studyMaterials.length,
      data: studyMaterials
    });
  } catch (err) {
    next(err);
  }
};

// Get study materials by category
exports.getMaterialsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const filteredMaterials = studyMaterials.filter(
      material => material.category === category
    );

    res.status(200).json({
      success: true,
      count: filteredMaterials.length,
      data: filteredMaterials
    });
  } catch (err) {
    next(err);
  }
};

// Get single study material
exports.getMaterialById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = studyMaterials.find(m => m.id === id);

    if (!material) {
      return next(new ErrorResponse(`Study material not found with id of ${id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (err) {
    next(err);
  }
};

// Download study material
exports.downloadMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = studyMaterials.find(m => m.id === id);

    if (!material) {
      return next(new ErrorResponse(`Study material not found with id of ${id}`, 404));
    }

    // In a real application, you would serve the actual file
    // For this mock, we'll just return a success message
    res.status(200).json({
      success: true,
      message: `Download initiated for ${material.title}`,
      downloadUrl: material.fileUrl
    });

    // Update download count
    material.downloadCount += 1;
  } catch (err) {
    next(err);
  }
};

// Upload study material (admin only)
exports.uploadMaterial = async (req, res, next) => {
  try {
    // Check if user is admin or super_admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Not authorized to upload study materials', 403));
    }

    const { title, description, category } = req.body;

    // In a real application, you would handle file uploads here
    // For this mock, we'll just create a new entry
    const newMaterial = {
      id: (studyMaterials.length + 1).toString(),
      title,
      description,
      category,
      fileUrl: `/uploads/study-materials/${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      thumbnailUrl: `/uploads/thumbnails/${category}-thumbnail.jpg`,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0
    };

    studyMaterials.push(newMaterial);

    res.status(201).json({
      success: true,
      data: newMaterial
    });
  } catch (err) {
    next(err);
  }
};

// Delete study material (admin only)
exports.deleteMaterial = async (req, res, next) => {
  try {
    // Check if user is admin or super_admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Not authorized to delete study materials', 403));
    }

    const { id } = req.params;
    const materialIndex = studyMaterials.findIndex(m => m.id === id);

    if (materialIndex === -1) {
      return next(new ErrorResponse(`Study material not found with id of ${id}`, 404));
    }

    // Remove the material from the array
    studyMaterials.splice(materialIndex, 1);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// Update study material (admin only)
exports.updateMaterial = async (req, res, next) => {
  try {
    // Check if user is admin or super_admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return next(new ErrorResponse('Not authorized to update study materials', 403));
    }

    const { id } = req.params;
    const materialIndex = studyMaterials.findIndex(m => m.id === id);

    if (materialIndex === -1) {
      return next(new ErrorResponse(`Study material not found with id of ${id}`, 404));
    }

    // Update the material
    studyMaterials[materialIndex] = {
      ...studyMaterials[materialIndex],
      ...req.body
    };

    res.status(200).json({
      success: true,
      data: studyMaterials[materialIndex]
    });
  } catch (err) {
    next(err);
  }
};