# 🚀 Admin Panel Backend

A complete, secure, and feature-rich backend for the Study AI Admin Panel. Built with Node.js, Express, and MongoDB.

## 📋 What I Built For You

### 🎯 **Core Features**
- **User Management**: Full CRUD operations for users with role-based access
- **Quiz Management**: Create, edit, delete quizzes with analytics
- **Notification System**: Send notifications to users with delivery tracking
- **Analytics Dashboard**: Real-time stats and performance metrics
- **System Monitoring**: Health checks and error logging
- **Security**: Rate limiting, authentication, and activity logging

### 🏗️ **Complete File Structure**
```
Admin/Backend/
├── package.json                 # Dependencies and scripts
├── server.js                   # Main server file
├── env.example                 # Environment variables template
├── config/
│   └── database.js            # MongoDB connection
├── models/                    # Database schemas
│   ├── Quiz.js               # Quiz and questions schema
│   ├── QuizAttempt.js        # Quiz attempt records
│   ├── Notification.js       # Notification system
│   ├── Analytics.js          # Analytics data
│   ├── Report.js             # System reports
│   ├── SystemLog.js          # Activity logging
│   └── Settings.js           # System settings
├── controllers/               # Business logic
│   ├── adminController.js    # Dashboard and analytics
│   ├── userController.js     # User management
│   ├── quizController.js     # Quiz management
│   └── notificationController.js # Notifications
├── middleware/                # Security and validation
│   ├── adminAuth.js          # Admin authentication
│   ├── validation.js         # Input validation
│   └── security.js           # Security measures
└── routes/                   # API endpoints
    ├── adminRoutes.js        # Admin dashboard routes
    ├── userRoutes.js         # User management routes
    ├── quizRoutes.js         # Quiz management routes
    └── notificationRoutes.js # Notification routes
```

## 🚀 Quick Setup

### 1. **Install Dependencies**
```bash
cd Admin/Backend
npm install
```

### 2. **Environment Setup**
```bash
# Copy the environment template
cp env.example .env

# Edit .env with your settings
# - Add your MongoDB connection string
# - Set a strong JWT secret
# - Configure other settings as needed
```

### 3. **Start the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 API Endpoints

### 🔐 **Authentication Required**
All admin routes require a valid JWT token with admin role.

**Header:** `Authorization: Bearer <your_jwt_token>`

### 📋 **Dashboard & Analytics**
- `GET /api/admin/dashboard/stats` - Dashboard overview statistics
- `GET /api/admin/analytics` - Detailed analytics data
- `GET /api/admin/system/health` - System health check

### 👥 **User Management**
- `GET /api/admin/users` - List all users (with pagination)
- `GET /api/admin/users/stats` - User statistics
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### 📝 **Quiz Management**
- `GET /api/admin/quizzes` - List all quizzes
- `GET /api/admin/quizzes/stats` - Quiz statistics
- `GET /api/admin/quizzes/attempts` - Quiz attempt analytics
- `GET /api/admin/quizzes/:id` - Get quiz details
- `POST /api/admin/quizzes` - Create new quiz
- `PUT /api/admin/quizzes/:id` - Update quiz
- `PATCH /api/admin/quizzes/:id/toggle-publication` - Publish/unpublish quiz
- `DELETE /api/admin/quizzes/:id` - Delete quiz

### 📢 **Notifications**
- `GET /api/notifications/admin` - List all notifications (admin)
- `GET /api/notifications/admin/analytics` - Notification analytics
- `POST /api/notifications/admin` - Create notification
- `PUT /api/notifications/admin/:id` - Update notification
- `DELETE /api/notifications/admin/:id` - Delete notification
- `GET /api/notifications/user` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read

## 🔒 Security Features

### ✅ **Built-in Security**
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Input Validation**: All inputs are validated and sanitized
- **Admin Authentication**: Role-based access control
- **Activity Logging**: All admin actions are logged
- **CORS Protection**: Configured for your frontend
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Secure error responses

### 🛡️ **Rate Limits**
- **Admin Routes**: 100 requests per 15 minutes
- **Sensitive Operations**: 10 requests per hour
- **Automatic IP Blocking**: For suspicious activity

## 📈 Analytics & Monitoring

### 📊 **What Gets Tracked**
- **User Activity**: Registrations, logins, engagement
- **Quiz Performance**: Attempts, scores, completion rates
- **System Health**: Response times, errors, uptime
- **Content Usage**: Material downloads, quiz popularity

### 🚨 **System Monitoring**
- **Error Logging**: All errors are logged with context
- **Performance Tracking**: API response times
- **Health Checks**: Database and system status
- **Activity Logs**: All admin actions tracked

## 🎛️ Environment Variables

### 🔧 **Required Settings**
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Security
JWT_SECRET=your_super_secret_jwt_key
ADMIN_PORT=5001

# Optional
ADMIN_FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_key
```

## 💡 Usage Examples

### 🔐 **Login as Admin**
```bash
# First, create an admin user or update existing user to admin role
# Then login to get JWT token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 📊 **Get Dashboard Stats**
```bash
curl -X GET http://localhost:5001/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 👤 **Create User**
```bash
curl -X POST http://localhost:5001/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"user"}'
```

### 📝 **Create Quiz**
```bash
curl -X POST http://localhost:5001/api/admin/quizzes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Basics",
    "description": "Test your JavaScript knowledge",
    "category": "programming",
    "questions": [
      {
        "question": "What is JavaScript?",
        "options": [
          {"text": "A programming language", "isCorrect": true},
          {"text": "A coffee type", "isCorrect": false}
        ]
      }
    ]
  }'
```

## 🔍 Testing

### ✅ **Health Check**
```bash
curl http://localhost:5001/api/health
```

### 📋 **API Documentation**
```bash
curl http://localhost:5001/api/docs
```

## 🚨 Troubleshooting

### ❌ **Common Issues**

1. **"Access denied" Error**
   - Make sure you're using a valid JWT token
   - Ensure the user has admin role

2. **Database Connection Failed**
   - Check your MongoDB URI in .env file
   - Ensure MongoDB cluster is running

3. **Rate Limit Exceeded**
   - Wait for the time window to reset
   - Check if there's suspicious activity

4. **Validation Errors**
   - Check the API documentation for required fields
   - Ensure data types match the schema

## 🎯 What This Gives You

✅ **Complete Admin Backend** - Ready to connect with your frontend
✅ **Security First** - Built with enterprise-level security
✅ **Scalable Architecture** - Easy to extend and modify
✅ **Real-time Analytics** - Track everything that matters
✅ **Professional Logging** - Monitor all activities
✅ **Error Handling** - Graceful error management
✅ **API Documentation** - Clear endpoint documentation

## 🚀 Next Steps

1. **Start the server** - `npm run dev`
2. **Test the endpoints** - Use the health check and docs
3. **Connect your frontend** - Update the frontend API calls
4. **Create admin user** - Either through signup or database
5. **Start managing** - Users, quizzes, and notifications!

---

**🎉 Your admin backend is now complete and ready to use!**

The backend provides everything you need to manage your Study AI platform effectively. All endpoints are secure, well-documented, and ready for production use.
