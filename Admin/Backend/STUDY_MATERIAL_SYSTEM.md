# Study Material Management System

## Overview

This system provides a comprehensive solution for managing study materials in an educational platform, with separate interfaces for administrators and users. The system supports various file types, categorization, and provides robust search and filtering capabilities.

## Features

### Admin Panel Features

- **Material Management**: Create, edit, delete, and manage study materials
- **File Upload**: Support for PDF, DOC, DOCX, TXT, images, and videos (up to 50MB)
- **Bulk Operations**: Bulk publish, archive, and delete materials
- **Advanced Filtering**: Filter by subject, difficulty, type, status, and search terms
- **Statistics Dashboard**: Comprehensive analytics and insights
- **Publication Control**: Draft, publish, and archive materials
- **User Management**: Manage user accounts and permissions

### User Features

- **Browse Materials**: Access published study materials
- **Search & Filter**: Find materials by subject, difficulty, type, and keywords
- **Download & Preview**: Download materials and preview content
- **Popular & Recent**: View trending and latest materials
- **Responsive Design**: Mobile-friendly interface

## System Architecture

### Backend Structure

```
Admin/Backend/
├── routes/
│   ├── studyMaterialRoutes.js          # Admin study material routes
│   ├── publicStudyMaterialRoutes.js    # Public user routes
│   └── userRoutes.js                   # User management routes
├── controllers/
│   ├── studyMaterialController.js      # Admin material controller
│   ├── publicStudyMaterialController.js # Public material controller
│   └── userController.js               # User management controller
├── models/
│   ├── StudyMaterial.js                # Study material data model
│   └── User.js                         # User data model
├── middleware/
│   ├── validation.js                   # Input validation
│   ├── adminAuth.js                    # Admin authentication
│   └── security.js                     # Security middleware
└── uploads/
    └── study-materials/                # File storage directory
```

### Frontend Structure

```
Admin/Frontend/src/components/materials/
├── StudyMaterialManagement.jsx         # Admin material management
├── StudyMaterialForm.jsx               # Material creation/editing form
├── StudyMaterialStats.jsx              # Statistics dashboard
└── UserStudyMaterials.jsx              # User material browsing
```

## API Endpoints

### Admin Routes (Protected)

- `GET /api/admin/study-materials` - List all materials with pagination
- `GET /api/admin/study-materials/stats` - Get material statistics
- `GET /api/admin/study-materials/:id` - Get material by ID
- `POST /api/admin/study-materials` - Create new material
- `PUT /api/admin/study-materials/:id` - Update material
- `DELETE /api/admin/study-materials/:id` - Delete material
- `PATCH /api/admin/study-materials/:id/toggle-publication` - Toggle publication
- `POST /api/admin/study-materials/bulk-publish` - Bulk publish materials
- `POST /api/admin/study-materials/bulk-delete` - Bulk delete materials

### Public Routes (No Authentication)

- `GET /api/study-materials` - List published materials
- `GET /api/study-materials/category/:category` - Materials by category
- `GET /api/study-materials/:id` - Get published material by ID
- `GET /api/study-materials/:id/download` - Download material
- `GET /api/study-materials/:id/preview` - Preview material
- `GET /api/study-materials/search` - Search materials
- `GET /api/study-materials/popular` - Get popular materials
- `GET /api/study-materials/recent` - Get recent materials
- `GET /api/study-materials/categories` - Get all categories

## Data Models

### StudyMaterial Schema

```javascript
{
  title: String,           // Material title
  description: String,      // Material description
  content: String,          // Text content (for notes)
  type: String,            // note, pdf, video, link
  subject: String,         // Subject category
  difficulty: String,      // beginner, intermediate, advanced
  tags: [String],          // Searchable tags
  author: ObjectId,        // Reference to User
  isPublished: Boolean,    // Publication status
  isPremium: Boolean,      // Premium content flag
  views: Number,           // View count
  downloads: Number,       // Download count
  rating: Number,          // Average rating
  totalRatings: Number,    // Total rating count
  fileUrl: String,         // File path
  fileSize: Number,        // File size in bytes
  thumbnail: String,       // Thumbnail URL
  status: String,          // draft, published, archived
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

### User Schema

```javascript
{
  name: String,            // User's full name
  email: String,           // Unique email address
  password: String,        // Hashed password
  role: String,            // user, admin
  status: String,          // Active, Inactive
  lastActive: Date,        // Last activity timestamp
  averageScore: Number,    // Average quiz score
  totalQuizzes: Number,    // Total quizzes taken
  studentsReached: Number, // For instructors
  isActive: Boolean,       // Account status
  avatar: String,          // Profile picture URL
  createdAt: Date,         // Account creation date
  updatedAt: Date          // Last update date
}
```

## File Upload System

### Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPEG, PNG, GIF
- **Videos**: MP4, WebM, OGG
- **Maximum Size**: 50MB per file

### File Storage

- Files are stored in `uploads/study-materials/` directory
- Unique filenames generated using timestamp and random suffix
- File metadata stored in database
- Automatic cleanup when materials are deleted

## Security Features

### Authentication & Authorization

- JWT-based authentication for admin routes
- Role-based access control (admin/user)
- Protected admin endpoints
- Public access to published materials

### Input Validation

- Comprehensive form validation
- File type and size validation
- SQL injection prevention
- XSS protection

### Rate Limiting

- Admin operation rate limiting
- Sensitive operation restrictions
- Request logging and monitoring

## Usage Examples

### Creating a Study Material (Admin)

```javascript
// Form data with file upload
const formData = new FormData();
formData.append("title", "Introduction to Machine Learning");
formData.append("description", "Comprehensive guide to ML fundamentals");
formData.append("subject", "Computer Science");
formData.append("difficulty", "beginner");
formData.append("type", "pdf");
formData.append("tags", "machine learning, AI, algorithms");
formData.append("isPublished", "true");
formData.append("file", fileInput.files[0]);

const response = await fetch("/api/admin/study-materials", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### Fetching Materials (User)

```javascript
// Get published materials with filters
const response = await fetch(
  "/api/study-materials?subject=Computer Science&difficulty=beginner&page=1&limit=12"
);
const data = await response.json();

// Download material
const downloadResponse = await fetch(
  `/api/study-materials/${materialId}/download`
);
const blob = await downloadResponse.blob();
// Handle download...
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

```bash
cd Admin/Backend
npm install
npm install multer  # For file uploads
```

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/study-ai
JWT_SECRET=your_jwt_secret_key
PORT=5001
NODE_ENV=development
```

### Frontend Setup

```bash
cd Admin/Frontend
npm install
npm run dev
```

## Deployment

### Production Considerations

- Use cloud storage (AWS S3, Google Cloud Storage) for files
- Implement CDN for better performance
- Set up proper backup and monitoring
- Configure HTTPS and security headers
- Use environment-specific configurations

### Scaling

- Implement caching (Redis)
- Use load balancers for multiple instances
- Database indexing for performance
- File compression and optimization

## Troubleshooting

### Common Issues

1. **File Upload Fails**: Check file size and type restrictions
2. **Authentication Errors**: Verify JWT token and admin role
3. **Database Connection**: Check MongoDB connection string
4. **File Not Found**: Verify upload directory permissions

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## License

This system is part of the AI-PSM educational platform.

## Support

For technical support and questions, please refer to the project documentation or contact the development team.


# Database Configuration
MONGO_URI=mongodb+srv://negiNeeraj:NeerajNegi123@myvideocall.jpo7x.mongodb.net/study-ai?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://negiNeeraj:NeerajNegi123@myvideocall.jpo7x.mongodb.net/study-ai?retryWrites=true&w=majority
# JWT Secret (use a strong, random string)
JWT_SECRET=NeerajNegi@1234

# Server Configuration
ADMIN_PORT=5001
NODE_ENV=development
# Gemini AI API Key (if using AI features)
GEMINI_API_KEY=AIzaSyD2y5PTNFcE8OO81EC16kPOMHoX9BjHIKI
GOOGLE_API_KEY=AIzaSyD2y5PTNFcE8OO81EC16kPOMHoX9BjHIKI
ALLOW_ALL_ORIGINS=true

# Admin Frontend URL (for CORS)
ADMIN_FRONTEND_URL=http://localhost:3001

FRONTEND_URL=http://localhost:3000
# Email Configuration (for notifications - optional)
EMAIL_FROM=admin@yourapp.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SENSITIVE_OPERATIONS_LIMIT=10

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Session Settings
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=info
LOG_RETENTION_DAYS=30
