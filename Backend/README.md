# AI-PSM Study Material System Backend

A comprehensive, secure backend system for AI-powered study material management with advanced Role-Based Access Control (RBAC).

## 🚀 Features

- **Comprehensive RBAC System**: User, Instructor, Admin, and Super Admin roles
- **Advanced Security**: JWT authentication, rate limiting, CORS, XSS protection
- **Permission-Based Access**: Granular permissions for different operations
- **MongoDB Integration**: Optimized database with proper indexing
- **API Security**: Input validation, SQL injection prevention, request logging
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: Database and API health checks

## 🏗️ Architecture

```
Backend/
├── config/           # Configuration files
├── controllers/      # Business logic controllers
├── middleware/       # Custom middleware (auth, RBAC, security)
├── models/          # Database models and schemas
├── routes/          # API route definitions
├── scripts/         # Database setup and utility scripts
├── server.js        # Main application entry point
└── package.json     # Dependencies and scripts
```

## 🛠️ Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0
- Git

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/study-ai
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Database Setup**
   ```bash
   # Basic setup (admin user only)
   npm run setup
   
   # Setup with test users
   npm run setup -- --create-test-users
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔐 RBAC System

### Roles Hierarchy

```
User (Basic) → Instructor → Admin → Super Admin
```

### Role Permissions

#### User Role
- `read:own_profile` - Read own profile
- `update:own_profile` - Update own profile
- `read:study_materials` - Access study materials
- `take:quizzes` - Take quizzes
- `read:own_quiz_results` - View own quiz results

#### Instructor Role
- All User permissions +
- `create:study_materials` - Create study materials
- `update:own_study_materials` - Update own materials
- `delete:own_study_materials` - Delete own materials
- `create:quizzes` - Create quizzes
- `update:own_quizzes` - Update own quizzes
- `delete:own_quizzes` - Delete own quizzes
- `read:quiz_attempts` - View quiz attempts
- `read:analytics` - Access analytics

#### Admin Role
- All Instructor permissions +
- `read:all_profiles` - Read all user profiles
- `update:all_profiles` - Update any user profile
- `delete:users` - Delete users
- `manage:study_materials` - Manage all study materials
- `manage:quizzes` - Manage all quizzes
- `manage:notifications` - Manage notifications
- `read:all_analytics` - Access all analytics
- `manage:system_settings` - Manage system settings

#### Super Admin Role
- All Admin permissions +
- `manage:admins` - Manage admin users
- `manage:system_config` - System configuration
- `access:logs` - Access system logs
- `manage:backups` - Manage backups
- `full_access` - Complete system access

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Account lockout after 5 failed attempts
- Token expiration and refresh

### API Security
- Rate limiting (API: 100/15min, Auth: 5/15min)
- CORS protection
- XSS prevention
- SQL injection prevention
- Request size validation
- Input sanitization

### Headers Security
- Helmet.js for security headers
- Content Security Policy
- XSS Protection
- Frame options

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Study Materials
- `GET /api/study-materials` - List materials
- `POST /api/study-materials` - Create material (Instructor+)
- `GET /api/study-materials/:id` - Get material
- `PUT /api/study-materials/:id` - Update material (Owner/Admin)
- `DELETE /api/study-materials/:id` - Delete material (Owner/Admin)

### Quizzes
- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes` - Create quiz (Instructor+)
- `GET /api/quizzes/:id` - Get quiz
- `PUT /api/quizzes/:id` - Update quiz (Owner/Admin)
- `DELETE /api/quizzes/:id` - Delete quiz (Owner/Admin)

### Admin (Admin role required)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - System analytics

### Health Checks
- `GET /api/health` - API health status
- `GET /api/health/db` - Database health status

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: user, instructor, admin, super_admin),
  permissions: [String],
  status: String (enum: Active, Inactive, Suspended, Pending),
  isActive: Boolean,
  emailVerified: Boolean,
  lastActive: Date,
  loginAttempts: Number,
  lockUntil: Date,
  preferences: Object,
  metadata: Object
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

### Health Checks
- API endpoint health monitoring
- Database connection status
- Response time tracking
- Error rate monitoring

### Logging
- Request/response logging
- Error logging with stack traces
- Security event logging
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI

# Test connection manually
mongo mongodb://localhost:27017/study-ai
```

#### JWT Token Issues
```bash
# Check JWT secret
echo $JWT_SECRET

# Verify token format
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/profile
```

#### Permission Denied
- Verify user role and permissions
- Check route protection middleware
- Ensure proper authentication headers

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check specific middleware
DEBUG=rbac:*,auth:* npm run dev
```

## 🔧 Development

### Code Style
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database Migrations
```bash
# Run migrations
npm run migrate

# Seed test data
npm run seed
```

## 📚 API Documentation

### Request Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

### Production Commands
```bash
# Install production dependencies
npm ci --only=production

# Start production server
npm start

# Health check
curl https://yourdomain.com/api/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Changelog

### v1.0.0
- Initial release with comprehensive RBAC
- Advanced security features
- Complete API documentation
- Database setup scripts
- Health monitoring system
