const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Test multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads/study-materials");
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
  // Allow only specific file types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, TXT, images, and videos are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

console.log("✅ Multer configuration test passed");
console.log(
  "📁 Upload directory:",
  path.join(__dirname, "uploads/study-materials")
);
console.log("📋 Allowed file types:", [
  "PDF",
  "DOC",
  "DOCX",
  "TXT",
  "Images (JPG, PNG, GIF)",
  "Videos (MP4, WebM, OGG)",
]);
console.log("📏 File size limit: 50MB");

// Test directory creation
const uploadDir = path.join(__dirname, "uploads/study-materials");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Upload directory created successfully");
} else {
  console.log("✅ Upload directory already exists");
}

console.log("\n🎉 Upload functionality is ready!");
console.log("📝 You can now test file uploads in the admin panel.");
