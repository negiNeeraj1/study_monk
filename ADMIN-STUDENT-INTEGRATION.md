# Admin-Student Panel Integration Guide

This guide explains how the Admin and Student panels are now integrated to work together seamlessly.

## Overview

The system now consists of:

- **Admin Panel**: For managing study materials and quizzes
- **Student Panel**: For students to access published materials and take quizzes
- **Shared Backend**: Admin backend serves both panels

## Key Changes Made

### 1. Admin Panel Improvements

#### Quiz Management

- ✅ **Fully implemented Quiz Management** (was previously just a placeholder)
- ✅ **Create, edit, delete quizzes** with questions and options
- ✅ **Publish/unpublish quizzes** for student access
- ✅ **Quiz statistics and analytics**
- ✅ **Bulk operations** for quiz management

#### Study Material Management

- ✅ **Already working** - upload, manage, and organize study materials
- ✅ **File upload support** (PDF, DOC, images, videos)
- ✅ **Publish/unpublish materials** for student access
- ✅ **Statistics and analytics**

### 2. Student Panel Updates

#### Removed Demo Content

- ✅ **Removed premium features section** (demo cards)
- ✅ **Removed mock data dependencies**
- ✅ **Clean, focused interface**

#### Real API Integration

- ✅ **Study materials now fetch from Admin APIs**
- ✅ **Quizzes now fetch from Admin APIs**
- ✅ **Real-time data synchronization**
- ✅ **Proper error handling**

### 3. Data Flow

```
Admin Panel → Admin Backend → Database
     ↓
Student Panel ← Admin Backend ← Database
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the Frontend directory:

```env
# Admin Backend API URL
VITE_ADMIN_API_URL=http://localhost:5001/api

# Main Backend API URL (for AI features)
VITE_API_BASE_URL=https://aistudy-xfxe.onrender.com/api
```

### 2. Start the Services

#### Start Admin Backend

```bash
cd Admin/Backend
npm install
npm start
```

Admin backend runs on port 5001

#### Start Admin Frontend

```bash
cd Admin/Frontend
npm install
npm run dev
```

Admin frontend runs on port 3000

#### Start Student Frontend

```bash
cd Frontend
npm install
npm run dev
```

Student frontend runs on port 3001

### 3. Usage Workflow

#### For Administrators:

1. **Login to Admin Panel** (http://localhost:3000)
2. **Upload Study Materials**:
   - Go to Study Material Management
   - Click "Add Material"
   - Fill in details and upload files
   - Set status to "Published" for student access
3. **Create Quizzes**:
   - Go to Quiz Management
   - Click "Create Quiz"
   - Add questions and options
   - Set correct answers
   - Publish quiz for student access

#### For Students:

1. **Access Student Panel** (http://localhost:3001)
2. **Browse Study Materials**:
   - View all published materials
   - Filter by subject/category
   - Download materials
3. **Take Quizzes**:
   - Browse available quizzes
   - Take quizzes and see results
   - View quiz history

## API Endpoints

### Study Materials (Public Access)

- `GET /api/study-materials` - Get published materials
- `GET /api/study-materials/:id/download` - Download material
- `GET /api/study-materials/:id/preview` - Preview material

### Study Materials (Admin Access)

- `GET /api/admin/study-materials` - Get all materials (with filters)
- `POST /api/admin/study-materials` - Create material
- `PUT /api/admin/study-materials/:id` - Update material
- `DELETE /api/admin/study-materials/:id` - Delete material
- `PATCH /api/admin/study-materials/:id/toggle-publication` - Toggle publication

### Quizzes (Public Access)

- `GET /api/admin/quizzes?published=true` - Get published quizzes
- `GET /api/admin/quizzes/:id` - Get quiz details
- `POST /api/quiz-attempts` - Submit quiz attempt

### Quizzes (Admin Access)

- `GET /api/admin/quizzes` - Get all quizzes
- `POST /api/admin/quizzes` - Create quiz
- `PUT /api/admin/quizzes/:id` - Update quiz
- `DELETE /api/admin/quizzes/:id` - Delete quiz
- `PATCH /api/admin/quizzes/:id/toggle-publication` - Toggle publication

## Data Structure

### Study Material

```javascript
{
  _id: "material_id",
  title: "Material Title",
  description: "Material description",
  subject: "Mathematics",
  type: "pdf|video|link|note",
  difficulty: "beginner|intermediate|advanced",
  status: "draft|published|archived",
  author: { name: "Author Name", email: "author@email.com" },
  fileUrl: "/uploads/study-materials/filename.pdf",
  downloads: 0,
  views: 0,
  tags: ["tag1", "tag2"],
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### Quiz

```javascript
{
  _id: "quiz_id",
  title: "Quiz Title",
  description: "Quiz description",
  category: "Mathematics",
  difficulty: "beginner|intermediate|advanced",
  questions: [
    {
      question: "What is 2+2?",
      options: [
        { text: "3", isCorrect: false },
        { text: "4", isCorrect: true },
        { text: "5", isCorrect: false }
      ]
    }
  ],
  timeLimit: 30,
  passingScore: 60,
  isPublished: true,
  createdBy: { name: "Creator Name" },
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Student panel shows no materials**:

   - Check if Admin backend is running
   - Verify materials are published in Admin panel
   - Check API URL configuration

2. **File downloads not working**:

   - Ensure Admin backend has proper file serving setup
   - Check file permissions in uploads directory

3. **Quiz not appearing for students**:
   - Verify quiz is published in Admin panel
   - Check quiz has questions and correct answers set

### Debug Steps

1. **Check Admin Backend Health**:

   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Check Database Connection**:

   ```bash
   curl http://localhost:5001/api/health/db
   ```

3. **Test API Endpoints**:

   ```bash
   # Get published materials
   curl http://localhost:5001/api/study-materials?status=published

   # Get published quizzes
   curl http://localhost:5001/api/admin/quizzes?published=true
   ```

## Future Enhancements

- [ ] Real-time notifications when new materials are published
- [ ] Student progress tracking
- [ ] Advanced analytics and reporting
- [ ] Mobile app integration
- [ ] Offline material access
- [ ] Collaborative features

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the API documentation at `/api/docs`
3. Check server logs for error details
4. Ensure all services are running and properly configured
