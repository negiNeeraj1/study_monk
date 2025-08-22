# 🚀 Complete Setup Guide

## 📁 **Project Structure**

```
AI-PSM - Copy/
├── Backend/           → Main Backend (Port 5000)
├── Frontend/          → Client App (Port 3000)
├── Admin/
│   ├── Backend/       → Admin Backend (Port 5001)
│   └── Frontend/      → Admin Panel (Port 3001)
└── start-all.bat     → Start all servers
```

## 🎯 **Quick Start**

### **Option 1: One-Click Start (Windows)**

```bash
# Double-click or run:
start-all.bat
```

### **Option 2: Manual Start**

```bash
# Terminal 1 - Main Backend
cd Backend
npm start

# Terminal 2 - Admin Backend
cd Admin/Backend
npm start

# Terminal 3 - Client Frontend
cd Frontend
npm run dev

# Terminal 4 - Admin Frontend
cd Admin/Frontend
npm run dev
```

## 🌐 **Access URLs**

| Service           | URL                       | Purpose                |
| ----------------- | ------------------------- | ---------------------- |
| **Client App**    | http://localhost:3000     | Student/User Interface |
| **Admin Panel**   | http://localhost:3001     | Admin Dashboard        |
| **Main Backend**  | http://localhost:5000/api | Client API             |
| **Admin Backend** | http://localhost:5001/api | Admin API              |

## 🔧 **Port Configuration**

- **3000**: Client Frontend (Students use this)
- **3001**: Admin Frontend (Admins use this)
- **5000**: Main Backend (Client API)
- **5001**: Admin Backend (Admin API)

## 📋 **Features Connected**

### **Client App (Port 3000)**

- ✅ User Authentication
- ✅ Study Materials
- ✅ Quiz System (connects to Admin Backend)
- ✅ AI Assistant
- ✅ Notifications (from Admin)
- ✅ Progress Tracking

### **Admin Panel (Port 3001)**

- ✅ Dashboard & Analytics
- ✅ User Management
- ✅ Quiz Creation & Management
- ✅ Notification System
- ✅ Content Management
- ✅ Reports & Statistics

## 🔒 **Database Setup**

Make sure your `.env` files are configured:

**Backend/.env:**

```env
MONGO_URI=mongodb://localhost:27017/studyai
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
```

**Admin/Backend/.env:**

```env
MONGO_URI=mongodb://localhost:27017/studyai
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 🚨 **Troubleshooting**

### **Port Already in Use:**

```bash
# Kill processes on specific ports
npx kill-port 3000 3001 5000 5001
```

### **Database Connection:**

```bash
# Start MongoDB locally
mongod
# OR use MongoDB Atlas connection string
```

### **NPM Dependencies:**

```bash
# Install all dependencies
cd Backend && npm install
cd ../Frontend && npm install
cd ../Admin/Backend && npm install
cd ../Admin/Frontend && npm install
```

## ✅ **Everything Connected!**

- 🔗 Admin creates quizzes → Students see them
- 🔗 Admin sends notifications → Students receive them
- 🔗 Student data → Shows in admin analytics
- 🔗 Shared MongoDB database
- 🔗 Real-time updates across all systems
