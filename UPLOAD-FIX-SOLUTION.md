# Study Material Upload Issue - Solution Guide

## Problem Identified

The admin panel upload is failing with `net::ERR_CONNECTION_RESET` when trying to reach `http://localhost:3001/api/admin/study-materials`, but the admin backend is configured to run on port **5001**.

## Root Causes

1. **Admin Backend Server Not Running**: The admin backend server needs to be started on port 5001
2. **Port Mismatch**: Error shows port 3001, but admin backend runs on port 5001
3. **Data Flow**: Only published materials appear in student panel

## Solution Steps

### Step 1: Start Admin Backend Server

Run the admin backend server on port 5001:

```bash
# Option 1: Use the batch file
start-admin-backend.bat

# Option 2: Manual start
cd Admin/Backend
npm install
npm start
```

### Step 2: Verify Server is Running

Check that the server is running on port 5001:

- Visit: http://localhost:5001/api/health
- Should return: `{"status":"ok","message":"Admin backend server is running"}`

### Step 3: Test Upload Flow

1. **Admin Panel**: Upload study material with "Publish immediately" checked
2. **Student Panel**: Refresh the page to see the new material

## Data Flow Architecture

```
Admin Panel (Port 3000)
    ↓ Upload to
Admin Backend (Port 5001)
    ↓ Store in MongoDB
    ↓ Public API serves
Student Panel (Port 5173)
    ↓ Fetches from
Public Study Materials API (Port 5001)
```

## Key Points

### Admin Panel Upload

- **Endpoint**: `POST http://localhost:5001/api/admin/study-materials`
- **Authentication**: Requires admin token
- **File Upload**: Supports multipart/form-data with multer

### Student Panel Access

- **Endpoint**: `GET http://localhost:5001/api/study-materials`
- **Authentication**: No authentication required (public API)
- **Filter**: Only shows materials with `status: "published"` and `isPublished: true`

### Publication Status

Materials only appear in student panel when:

- `status: "published"`
- `isPublished: true`

## Troubleshooting

### If Upload Still Fails:

1. Check MongoDB is running
2. Verify admin backend server is on port 5001
3. Check browser console for specific error messages
4. Ensure admin user is logged in with valid token

### If Materials Don't Appear in Student Panel:

1. Check if material is published (`isPublished: true`)
2. Check material status (`status: "published"`)
3. Refresh student panel page
4. Check browser network tab for API calls

## File Structure

```
Admin/Backend/
├── server.js (Port 5001)
├── routes/
│   ├── studyMaterialRoutes.js (Admin routes)
│   └── publicStudyMaterialRoutes.js (Public routes)
├── controllers/
│   ├── studyMaterialController.js (Admin controller)
│   └── publicStudyMaterialController.js (Public controller)
└── models/
    └── StudyMaterial.js (Shared model)
```

## API Endpoints

### Admin Routes (Authentication Required)

- `POST /api/admin/study-materials` - Create material
- `PUT /api/admin/study-materials/:id` - Update material
- `GET /api/admin/study-materials` - List all materials (admin view)

### Public Routes (No Authentication)

- `GET /api/study-materials` - List published materials
- `GET /api/study-materials/:id` - Get material details
- `GET /api/study-materials/:id/download` - Download material

## Environment Variables

Make sure these are set in Admin/Backend/.env:

```
MONGODB_URI=mongodb://localhost:27017/study-ai
JWT_SECRET=your_super_secret_jwt_key_for_study_ai_app_2024
PORT=5001
NODE_ENV=development
```
