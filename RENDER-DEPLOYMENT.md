# Complete Render Deployment Guide for AI-PSM Study Material System

This guide will help you deploy your complete AI-PSM project to Render, including all four services:
1. Main Backend (User API)
2. Admin Backend (Admin API)
3. Main Frontend (User Interface)
4. Admin Frontend (Admin Interface)

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Atlas Account**: For database hosting
3. **Google AI API Key**: For AI features
4. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Prepare Your Repository

### 1.1 Update Environment Variables
Make sure your repository has the updated `render.yaml` file in the root directory.

### 1.2 Commit and Push Your Changes
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Create Database User**:
   - Go to Database Access
   - Create a new user with read/write permissions
   - Note down username and password

3. **Get Connection String**:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>` with your values

## Step 3: Deploy to Render

### 3.1 Connect Your Repository
1. Log in to [render.com](https://render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing your AI-PSM project

### 3.2 Configure Services
Render will automatically detect the `render.yaml` file and create 4 services:

#### Service 1: Main Backend (study-ai-backend)
- **Type**: Web Service
- **Environment**: Node
- **Root Directory**: `Backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Service 2: Admin Backend (study-ai-admin-backend)
- **Type**: Web Service
- **Environment**: Node
- **Root Directory**: `Admin/Backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Service 3: Main Frontend (study-ai-frontend)
- **Type**: Static Site
- **Root Directory**: `Frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

#### Service 4: Admin Frontend (study-ai-admin)
- **Type**: Static Site
- **Root Directory**: `Admin/Frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 3.3 Set Environment Variables

For each service, you need to set these environment variables in the Render dashboard:

#### Main Backend Environment Variables:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/study-ai?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
FRONTEND_URL=https://study-ai-frontend.onrender.com
ADMIN_URL=https://study-ai-admin.onrender.com
ALLOW_ALL_ORIGINS=false
```

#### Admin Backend Environment Variables:
```
NODE_ENV=production
PORT=10001
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/study-ai?retryWrites=true&w=majority
JWT_SECRET=your_admin_jwt_secret_here_change_this
ADMIN_JWT_SECRET=your_admin_specific_jwt_secret_here_change_this
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_FRONTEND_URL=https://study-ai-admin.onrender.com
FRONTEND_URL=https://study-ai-frontend.onrender.com
MAIN_BACKEND_URL=https://study-ai-backend.onrender.com
```

#### Main Frontend Environment Variables:
```
VITE_API_URL=https://study-ai-backend.onrender.com/api
VITE_ADMIN_API_URL=https://study-ai-admin-backend.onrender.com/api
```

#### Admin Frontend Environment Variables:
```
VITE_API_URL=https://study-ai-admin-backend.onrender.com/api
VITE_MAIN_API_URL=https://study-ai-backend.onrender.com/api
```

## Step 4: Deploy and Monitor

### 4.1 Deploy Services
1. Click "Create Blueprint Instance"
2. Render will automatically deploy all 4 services
3. Monitor the deployment logs for each service

### 4.2 Check Service Health
After deployment, verify each service is running:
- Main Backend: `https://study-ai-backend.onrender.com/api/health`
- Admin Backend: `https://study-ai-admin-backend.onrender.com/api/health`
- Main Frontend: `https://study-ai-frontend.onrender.com`
- Admin Frontend: `https://study-ai-admin.onrender.com`

## Step 5: Post-Deployment Setup

### 5.1 Create Admin User
After successful deployment, you need to create an admin user:

1. **Option 1: Use Admin Backend Setup Script**
   ```bash
   # Access your admin backend service
   curl -X POST https://study-ai-admin-backend.onrender.com/api/admin/setup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "admin123",
       "name": "Admin User"
     }'
   ```

2. **Option 2: Use MongoDB Atlas**
   - Go to your MongoDB Atlas cluster
   - Navigate to Collections
   - Find the `users` collection
   - Add a user document with `role: "admin"`

### 5.2 Test All Features
1. **User Registration/Login**: Test on main frontend
2. **Admin Login**: Test on admin frontend
3. **Study Material Upload**: Test file uploads
4. **Quiz Features**: Test quiz creation and taking
5. **AI Features**: Test AI-powered features

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domains
1. Go to each service in Render dashboard
2. Click "Settings" → "Custom Domains"
3. Add your domain names
4. Update DNS records as instructed

### 6.2 Update Environment Variables
After adding custom domains, update the environment variables:
- `FRONTEND_URL`
- `ADMIN_URL`
- `ADMIN_FRONTEND_URL`
- `VITE_API_URL`
- `VITE_ADMIN_API_URL`

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **CORS Errors**:
   - Verify CORS_ORIGIN environment variables
   - Check frontend URLs in backend environment variables

4. **Environment Variable Issues**:
   - Double-check all environment variables are set
   - Ensure no typos in variable names
   - Verify sensitive data is properly set

### Debug Commands:
```bash
# Check service logs
# Go to Render dashboard → Service → Logs

# Test API endpoints
curl https://study-ai-backend.onrender.com/api/health
curl https://study-ai-admin-backend.onrender.com/api/health

# Test frontend access
curl -I https://study-ai-frontend.onrender.com
curl -I https://study-ai-admin.onrender.com
```

## Security Considerations

1. **JWT Secrets**: Use strong, unique secrets for production
2. **API Keys**: Never commit API keys to repository
3. **Database**: Use strong passwords for database users
4. **CORS**: Restrict CORS origins to your domains only
5. **Rate Limiting**: Ensure rate limiting is enabled

## Monitoring and Maintenance

1. **Set up Logging**: Monitor application logs regularly
2. **Database Backups**: Set up automated MongoDB Atlas backups
3. **Performance Monitoring**: Use Render's built-in monitoring
4. **Security Updates**: Keep dependencies updated
5. **SSL Certificates**: Render provides automatic SSL

## Cost Optimization

1. **Free Tier Limits**: Be aware of Render's free tier limitations
2. **Database**: MongoDB Atlas M0 tier is free
3. **Scaling**: Upgrade only when necessary
4. **Monitoring**: Use free monitoring tools

## Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Project Issues**: Check your project's GitHub issues

---

**Note**: This deployment will create 4 separate services on Render. Each service will have its own URL and can be scaled independently. Make sure to update all environment variables with your actual values before deployment.

