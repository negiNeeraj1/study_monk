# 🔧 Study Monk Backend Setup Guide

## 🚨 Current Error Fix

### **Main Issue: Missing Gemini API Key**

The error you're seeing:
```
API key not valid. Please pass a valid API key.
No available models found
```

This occurs because the `GEMINI_API_KEY` environment variable is not set.

## 📋 Quick Fix Steps

### Step 1: Create `.env` File

1. Navigate to the `Backend` directory:
   ```bash
   cd study_monk/Backend
   ```

2. Create a `.env` file (copy from the example below or create manually)

3. Add the following content to `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/study-ai

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key_for_study_ai_app_2024

# ⚠️ IMPORTANT: Gemini API Key (REQUIRED)
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Step 2: Get Your Gemini API Key

1. **Visit Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Create a new API key** or use an existing one
4. **Copy the API key**
5. **Paste it** in your `.env` file:
   ```
   GEMINI_API_KEY=paste_your_key_here
   ```

### Step 3: Restart the Server

After adding the API key:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
```

## ✅ Verification

After restarting, test the API:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test quiz generation (requires authentication)
# Use your frontend or Postman with proper auth token
```

## 🔍 Complete Error Analysis

### Issues Found:

1. ✅ **Missing GEMINI_API_KEY** - Fixed by creating `.env` file
2. ✅ **Circular reference in config/db.js** - Fixed
3. ✅ **No .env.example file** - Created setup guide

### Other Potential Issues to Check:

1. **MongoDB Connection**: Ensure MongoDB is running
   ```bash
   # Check MongoDB status (Windows)
   # MongoDB should be running on localhost:27017
   ```

2. **Node Modules**: Ensure all dependencies are installed
   ```bash
   npm install
   ```

3. **Port Conflicts**: Ensure port 5000 is available
   ```bash
   # Check if port is in use
   netstat -ano | findstr :5000
   ```

## 📝 Environment Variables Reference

### Required Variables:
- `GEMINI_API_KEY` - **REQUIRED** for AI features (quiz generation, chat)
- `JWT_SECRET` - Required for authentication (has default fallback)
- `MONGODB_URI` - Required for database (has default fallback)

### Optional Variables:
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: localhost)
- `FRONTEND_URL` - Frontend URL for CORS
- `ADMIN_URL` - Admin frontend URL for CORS

## 🛠️ Troubleshooting

### Error: "API key not valid"
- ✅ Check that `.env` file exists in `Backend` directory
- ✅ Verify `GEMINI_API_KEY` is set correctly (no quotes, no spaces)
- ✅ Ensure the API key is valid (check Google AI Studio)
- ✅ Restart the server after adding the key

### Error: "No available models found"
- This happens when all Gemini models fail to connect
- Usually caused by invalid API key
- Check API key validity and quota

### Error: "MongoDB connection failed"
- Ensure MongoDB is installed and running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB is accessible on the specified host/port

### Error: "Token expired" or "Invalid token"
- This is normal authentication behavior
- User needs to login again
- Check `JWT_SECRET` is set (has default fallback)

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [MongoDB Connection Guide](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

## 🎯 Next Steps

After fixing the API key issue:

1. ✅ Test quiz generation endpoint
2. ✅ Test AI chat assistant
3. ✅ Verify all API endpoints work
4. ✅ Check frontend integration

---

**Need Help?** Check the main README.md or create an issue in the repository.

