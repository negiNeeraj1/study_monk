const StudyMaterial = require("../models/StudyMaterial");
const path = require("path");
const fs = require("fs");

// Get all published study materials
exports.getAllPublishedMaterials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      subject = "",
      difficulty = "",
      type = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query - only published materials
    let query = { status: "published", isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (subject && subject !== "all") {
      query.subject = subject;
    }

    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [materials, totalMaterials] = await Promise.all([
      StudyMaterial.find(query)
        .populate("author", "name")
        .select("-content")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudyMaterial.countDocuments(query),
    ]);

    // Add file information
    const materialsWithFileInfo = materials.map((material) => {
      let fileInfo = {};
      if (material.fileUrl) {
        const filePath = path.join(
          __dirname,
          "../uploads/study-materials",
          path.basename(material.fileUrl)
        );
        try {
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            fileInfo = {
              fileSize: stats.size,
              fileSizeFormatted: formatFileSize(stats.size),
              fileExists: true,
            };
          } else {
            fileInfo = {
              fileSize: 0,
              fileSizeFormatted: "0 B",
              fileExists: false,
            };
          }
        } catch (error) {
          fileInfo = {
            fileSize: 0,
            fileSizeFormatted: "0 B",
            fileExists: false,
          };
        }
      }
      return { ...material, fileInfo };
    });

    res.json({
      success: true,
      data: {
        materials: materialsWithFileInfo,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalMaterials / parseInt(limit)),
          count: totalMaterials,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get published materials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch study materials",
    });
  }
};

// Get materials by category
exports.getMaterialsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [materials, totalMaterials] = await Promise.all([
      StudyMaterial.find({
        subject: category,
        status: "published",
        isPublished: true,
      })
        .populate("author", "name")
        .select("-content")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudyMaterial.countDocuments({
        subject: category,
        status: "published",
        isPublished: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        materials,
        category,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalMaterials / parseInt(limit)),
          count: totalMaterials,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get materials by category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials by category",
    });
  }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findOne({
      _id: id,
      status: "published",
      isPublished: true,
    })
      .populate("author", "name")
      .lean();

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found or not published",
      });
    }

    // Update view count
    await StudyMaterial.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Add file information
    let fileInfo = {};
    if (material.fileUrl) {
      const filePath = path.join(
        __dirname,
        "../uploads/study-materials",
        path.basename(material.fileUrl)
      );
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          fileInfo = {
            fileSize: stats.size,
            fileSizeFormatted: formatFileSize(stats.size),
            fileExists: true,
            lastModified: stats.mtime,
          };
        } else {
          fileInfo = {
            fileSize: 0,
            fileSizeFormatted: "0 B",
            fileExists: false,
          };
        }
      } catch (error) {
        fileInfo = {
          fileSize: 0,
          fileSizeFormatted: "0 B",
          fileExists: false,
        };
      }
    }

    res.json({
      success: true,
      data: {
        material: { ...material, fileInfo },
      },
    });
  } catch (error) {
    console.error("Get material by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch study material details",
    });
  }
};

// Download material
exports.downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findOne({
      _id: id,
      status: "published",
      isPublished: true,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found or not published",
      });
    }

    if (!material.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "No file associated with this material",
      });
    }

    const filePath = path.join(
      __dirname,
      "../uploads/study-materials",
      path.basename(material.fileUrl)
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Update download count
    await StudyMaterial.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

    // Get file extension and set appropriate MIME type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    let fileName = `${material.title}${ext}`;

    // Set correct MIME type based on file extension
    switch (ext) {
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".doc":
        contentType = "application/msword";
        break;
      case ".docx":
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".ppt":
        contentType = "application/vnd.ms-powerpoint";
        break;
      case ".pptx":
        contentType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        break;
      case ".txt":
        contentType = "text/plain";
        break;
      case ".csv":
        contentType = "text/csv";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".mp4":
        contentType = "video/mp4";
        break;
      case ".webm":
        contentType = "video/webm";
        break;
      case ".ogg":
        contentType = "video/ogg";
        break;
      case ".avi":
        contentType = "video/x-msvideo";
        break;
      case ".mp3":
        contentType = "audio/mpeg";
        break;
      case ".wav":
        contentType = "audio/wav";
        break;
      default:
        contentType = "application/octet-stream";
    }

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", contentType);

    console.log("Download headers set:", {
      contentType,
      fileName,
      filePath,
      ext,
    });

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download material error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download material",
    });
  }
};

// Preview material
exports.previewMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findOne({
      _id: id,
      status: "published",
      isPublished: true,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found or not published",
      });
    }

    if (!material.fileUrl) {
      return res.status(400).json({
        success: false,
        message: "No file associated with this material",
      });
    }

    const filePath = path.join(
      __dirname,
      "../uploads/study-materials",
      path.basename(material.fileUrl)
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Set appropriate content type for preview
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "text/plain";

    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".ogg") contentType = "video/ogg";

    res.setHeader("Content-Type", contentType);

    // Stream the file for preview
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Preview material error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to preview material",
    });
  }
};

// Search materials
exports.searchMaterials = async (req, res) => {
  try {
    const {
      q = "",
      page = 1,
      limit = 12,
      subject = "",
      difficulty = "",
      type = "",
    } = req.query;

    if (!q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Build search query
    let query = {
      status: "published",
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { subject: { $regex: q, $options: "i" } },
      ],
    };

    if (subject && subject !== "all") {
      query.subject = subject;
    }

    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [materials, totalMaterials] = await Promise.all([
      StudyMaterial.find(query)
        .populate("author", "name")
        .select("-content")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudyMaterial.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        materials,
        searchQuery: q,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalMaterials / parseInt(limit)),
          count: totalMaterials,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Search materials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search materials",
    });
  }
};

// Get popular materials
exports.getPopularMaterials = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const materials = await StudyMaterial.find({
      status: "published",
      isPublished: true,
    })
      .populate("author", "name")
      .select("-content")
      .sort({ views: -1, downloads: -1, rating: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        materials,
      },
    });
  } catch (error) {
    console.error("Get popular materials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular materials",
    });
  }
};

// Get recent materials
exports.getRecentMaterials = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const materials = await StudyMaterial.find({
      status: "published",
      isPublished: true,
    })
      .populate("author", "name")
      .select("-content")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        materials,
      },
    });
  } catch (error) {
    console.error("Get recent materials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent materials",
    });
  }
};

// Get materials by difficulty
exports.getMaterialsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [materials, totalMaterials] = await Promise.all([
      StudyMaterial.find({
        difficulty,
        status: "published",
        isPublished: true,
      })
        .populate("author", "name")
        .select("-content")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudyMaterial.countDocuments({
        difficulty,
        status: "published",
        isPublished: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        materials,
        difficulty,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalMaterials / parseInt(limit)),
          count: totalMaterials,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get materials by difficulty error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials by difficulty",
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await StudyMaterial.aggregate([
      {
        $match: { status: "published", isPublished: true },
      },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// Get materials by tag
exports.getMaterialsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [materials, totalMaterials] = await Promise.all([
      StudyMaterial.find({
        tags: { $in: [new RegExp(tag, "i")] },
        status: "published",
        isPublished: true,
      })
        .populate("author", "name")
        .select("-content")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudyMaterial.countDocuments({
        tags: { $in: [new RegExp(tag, "i")] },
        status: "published",
        isPublished: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        materials,
        tag,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalMaterials / parseInt(limit)),
          count: totalMaterials,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get materials by tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials by tag",
    });
  }
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
