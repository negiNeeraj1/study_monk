const StudyMaterial = require("../models/StudyMaterial");
const User = require("../models/User");
const SystemLog = require("../models/SystemLog");
const path = require("path");
const fs = require("fs");

// Get all study materials with pagination and filters
exports.getAllMaterials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      subject = "",
      difficulty = "",
      status = "",
      type = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req.query;

    // Build query
    let query = {};

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

    if (status && status !== "all") {
      query.status = status;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [materials, totalMaterials] = await Promise.all([
      StudyMaterial.find(query)
        .populate("author", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudyMaterial.countDocuments(query),
    ]);

    // Add file size and type information
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
    console.error("Get study materials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch study materials",
    });
  }
};

// Get study material statistics
exports.getStudyMaterialStats = async (req, res) => {
  try {
    const [
      totalMaterials,
      publishedMaterials,
      draftMaterials,
      archivedMaterials,
      totalViews,
      totalDownloads,
      materialsBySubject,
      materialsByDifficulty,
      materialsByType,
      recentUploads,
      topMaterials,
    ] = await Promise.all([
      StudyMaterial.countDocuments(),
      StudyMaterial.countDocuments({ status: "published" }),
      StudyMaterial.countDocuments({ status: "draft" }),
      StudyMaterial.countDocuments({ status: "archived" }),
      StudyMaterial.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]),
      StudyMaterial.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: "$downloads" } } },
      ]),
      StudyMaterial.aggregate([
        { $group: { _id: "$subject", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      StudyMaterial.aggregate([
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      StudyMaterial.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      StudyMaterial.find()
        .populate("author", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title subject author createdAt"),
      StudyMaterial.find()
        .sort({ views: -1, downloads: -1 })
        .limit(10)
        .select("title subject views downloads rating"),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalMaterials,
          published: publishedMaterials,
          draft: draftMaterials,
          archived: archivedMaterials,
          totalViews: totalViews[0]?.totalViews || 0,
          totalDownloads: totalDownloads[0]?.totalDownloads || 0,
        },
        distribution: {
          bySubject: materialsBySubject,
          byDifficulty: materialsByDifficulty,
          byType: materialsByType,
        },
        recentUploads,
        topMaterials,
      },
    });
  } catch (error) {
    console.error("Get study material stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch study material statistics",
    });
  }
};

// Get study material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findById(id)
      .populate("author", "name email")
      .lean();

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

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

// Create new study material
exports.createMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      type,
      subject,
      difficulty,
      tags,
      isPublished,
      isPremium,
      status,
    } = req.body;

    // Handle file upload
    let fileUrl = "";
    let fileSize = 0;
    if (req.file) {
      fileUrl = `/uploads/study-materials/${req.file.filename}`;
      fileSize = req.file.size;
    }

    // Create study material
    const parseBool = (val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val.toLowerCase() === "true";
      return false;
    };

    // Ensure status and isPublished remain consistent
    const requestedStatus = (status || "").toString().toLowerCase();
    const effectivePublished =
      parseBool(isPublished) || requestedStatus === "published";

    const studyMaterial = new StudyMaterial({
      title,
      description,
      content,
      type,
      subject,
      difficulty,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      author: req.user.id,
      isPublished: effectivePublished,
      isPremium: parseBool(isPremium),
      status: effectivePublished ? "published" : requestedStatus || "draft",
      fileUrl,
      fileSize,
    });

    await studyMaterial.save();

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Study material "${title}" created`,
      module: "study-material",
      action: "create",
      userId: req.user.id,
      metadata: {
        materialId: studyMaterial._id,
        title,
        subject,
        type,
      },
    });

    res.status(201).json({
      success: true,
      message: "Study material created successfully",
      data: {
        material: studyMaterial,
      },
    });
  } catch (error) {
    console.error("Create material error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create study material",
    });
  }
};

// Update study material
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if material exists
    const existingMaterial = await StudyMaterial.findById(id);
    if (!existingMaterial) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    // Handle file upload
    if (req.file) {
      // Delete old file if it exists
      if (existingMaterial.fileUrl) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads/study-materials",
          path.basename(existingMaterial.fileUrl)
        );
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (error) {
          console.error("Error deleting old file:", error);
        }
      }

      updateData.fileUrl = `/uploads/study-materials/${req.file.filename}`;
      updateData.fileSize = req.file.size;
    }

    // Handle tags
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(",").map((tag) => tag.trim());
    }

    // Handle publication status: keep status and isPublished in sync
    const isPublishedProvided = Object.prototype.hasOwnProperty.call(
      updateData,
      "isPublished"
    );
    const statusProvided = Object.prototype.hasOwnProperty.call(
      updateData,
      "status"
    );
    if (isPublishedProvided || statusProvided) {
      const parseBool = (val) => {
        if (typeof val === "boolean") return val;
        if (typeof val === "string") return val.toLowerCase() === "true";
        return false;
      };
      const requestedStatus = (
        updateData.status ||
        existingMaterial.status ||
        ""
      )
        .toString()
        .toLowerCase();
      const effectivePublished =
        parseBool(updateData.isPublished) || requestedStatus === "published";
      updateData.isPublished = effectivePublished;
      updateData.status = effectivePublished ? "published" : "draft";
    }

    // Update material
    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "name email");

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Study material "${updatedMaterial.title}" updated`,
      module: "study-material",
      action: "update",
      userId: req.user.id,
      metadata: {
        materialId: updatedMaterial._id,
        title: updatedMaterial.title,
        changes: Object.keys(updateData),
      },
    });

    res.json({
      success: true,
      message: "Study material updated successfully",
      data: {
        material: updatedMaterial,
      },
    });
  } catch (error) {
    console.error("Update material error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update study material",
    });
  }
};

// Delete study material
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    // Delete associated file
    if (material.fileUrl) {
      const filePath = path.join(
        __dirname,
        "../uploads/study-materials",
        path.basename(material.fileUrl)
      );
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }

    await StudyMaterial.findByIdAndDelete(id);

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Study material "${material.title}" deleted`,
      module: "study-material",
      action: "delete",
      userId: req.user.id,
      metadata: {
        materialId: material._id,
        title: material.title,
      },
    });

    res.json({
      success: true,
      message: "Study material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete study material",
    });
  }
};

// Toggle publication status
exports.togglePublication = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const newStatus = material.status === "published" ? "draft" : "published";
    material.status = newStatus;
    material.isPublished = newStatus === "published";
    await material.save();

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Study material "${material.title}" ${newStatus}`,
      module: "study-material",
      action: "toggle-publication",
      userId: req.user.id,
      metadata: {
        materialId: material._id,
        title: material.title,
        newStatus,
      },
    });

    res.json({
      success: true,
      message: `Study material ${newStatus} successfully`,
      data: {
        material,
      },
    });
  } catch (error) {
    console.error("Toggle publication error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle publication status",
    });
  }
};

// Bulk publish materials
exports.bulkPublish = async (req, res) => {
  try {
    const { materialIds } = req.body;

    if (
      !materialIds ||
      !Array.isArray(materialIds) ||
      materialIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid material IDs",
      });
    }

    const result = await StudyMaterial.updateMany(
      { _id: { $in: materialIds } },
      { status: "published", isPublished: true }
    );

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Bulk published ${result.modifiedCount} study materials`,
      module: "study-material",
      action: "bulk-publish",
      userId: req.user.id,
      metadata: {
        materialIds,
        modifiedCount: result.modifiedCount,
      },
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} materials published successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Bulk publish error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk publish materials",
    });
  }
};

// Bulk delete materials
exports.bulkDelete = async (req, res) => {
  try {
    const { materialIds } = req.body;

    if (
      !materialIds ||
      !Array.isArray(materialIds) ||
      materialIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid material IDs",
      });
    }

    // Get materials to delete files
    const materials = await StudyMaterial.find({ _id: { $in: materialIds } });

    // Delete associated files
    for (const material of materials) {
      if (material.fileUrl) {
        const filePath = path.join(
          __dirname,
          "../uploads/study-materials",
          path.basename(material.fileUrl)
        );
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
    }

    const result = await StudyMaterial.deleteMany({
      _id: { $in: materialIds },
    });

    // Log the action
    await SystemLog.create({
      level: "info",
      message: `Bulk deleted ${result.deletedCount} study materials`,
      module: "study-material",
      action: "bulk-delete",
      userId: req.user.id,
      metadata: {
        materialIds,
        deletedCount: result.deletedCount,
      },
    });

    res.json({
      success: true,
      message: `${result.deletedCount} materials deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk delete materials",
    });
  }
};

// Download material
exports.downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
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
    material.downloads += 1;
    await material.save();

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
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".ppt":
        contentType = "application/vnd.ms-powerpoint";
        break;
      case ".pptx":
        contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
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

    const material = await StudyMaterial.findById(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
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

    // Update view count
    material.views += 1;
    await material.save();

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

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await StudyMaterial.aggregate([
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

// Get category statistics
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await StudyMaterial.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalDownloads: { $sum: "$downloads" },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get category stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category statistics",
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
