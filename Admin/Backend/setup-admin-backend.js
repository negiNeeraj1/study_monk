#!/usr/bin/env node

/**
 * Admin Backend Setup Script
 * This script helps configure and test the Admin Backend
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

console.log("🚀 Admin Backend Setup Script");
console.log("==============================\n");

// Step 1: Check and create .env file
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, "env.example");

if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env file from template...");
  
  try {
    let envContent = fs.readFileSync(envExamplePath, "utf8");
    
    // Update with local development values
    envContent = envContent.replace(
      "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name",
      "MONGO_URI=mongodb://localhost:27017/study-ai"
    );
    
    envContent = envContent.replace(
      "ADMIN_PORT=5001",
      "PORT=5001"
    );
    
    envContent = envContent.replace(
      "ADMIN_FRONTEND_URL=http://localhost:3000",
      "ADMIN_FRONTEND_URL=http://localhost:3001"
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file created successfully");
    
    // Reload environment variables
    require("dotenv").config({ path: envPath });
    
  } catch (error) {
    console.error("❌ Failed to create .env file:", error.message);
    console.log("\n📋 Please manually create a .env file with these values:");
    console.log("MONGO_URI=mongodb://localhost:27017/study-ai");
    console.log("JWT_SECRET=your_super_secret_jwt_key_for_study_ai_app_2024");
    console.log("PORT=5001");
    console.log("NODE_ENV=development");
    console.log("ADMIN_FRONTEND_URL=http://localhost:3001");
    return;
  }
} else {
  console.log("✅ .env file already exists");
  require("dotenv").config({ path: envPath });
}

// Step 2: Validate environment variables
console.log("\n🔍 Validating Environment Variables...");

const requiredVars = ["MONGO_URI", "JWT_SECRET", "PORT"];
const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: NOT SET`);
  } else {
    console.log(`✅ ${varName}: SET`);
  }
});

if (missingVars.length > 0) {
  console.error(`\n❌ Missing required environment variables: ${missingVars.join(", ")}`);
  console.log("Please check your .env file and restart the script");
  return;
}

// Step 3: Test database connection
console.log("\n🗄️ Testing Database Connection...");

const mongoose = require("mongoose");

const testDBConnection = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`Connecting to: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log("✅ Database connection successful!");
    console.log(`- Host: ${conn.connection.host}`);
    console.log(`- Database: ${conn.connection.name}`);
    
    // Test User model
    try {
      const User = require("../../Backend/models/User");
      const userCount = await User.countDocuments();
      console.log(`✅ User model test successful - ${userCount} users found`);
    } catch (modelError) {
      console.error("❌ User model test failed:", modelError.message);
    }
    
    await mongoose.disconnect();
    console.log("✅ Database connection closed");
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Make sure MongoDB is running on your system");
    console.log("2. Check if the connection string is correct");
    console.log("3. For local MongoDB: mongodb://localhost:27017/study-ai");
    console.log("4. For MongoDB Atlas: Check your connection string and network access");
    return false;
  }
  
  return true;
};

// Step 4: Test server startup
const testServerStartup = async () => {
  console.log("\n🚀 Testing Server Startup...");
  
  try {
    // Temporarily change port to avoid conflicts
    const originalPort = process.env.PORT;
    process.env.PORT = 5002;
    
    const app = require("express")();
    const server = app.listen(process.env.PORT, () => {
      console.log(`✅ Test server started on port ${process.env.PORT}`);
      server.close(() => {
        console.log("✅ Test server closed");
        process.env.PORT = originalPort;
      });
    });
    
  } catch (error) {
    console.error("❌ Server startup test failed:", error.message);
    return false;
  }
  
  return true;
};

// Step 5: Run tests
const runSetup = async () => {
  console.log("\n🧪 Running Setup Tests...\n");
  
  const dbTest = await testDBConnection();
  if (!dbTest) {
    console.log("\n❌ Setup incomplete. Please fix database issues first.");
    return;
  }
  
  const serverTest = await testServerStartup();
  if (!serverTest) {
    console.log("\n❌ Setup incomplete. Please fix server issues first.");
    return;
  }
  
  console.log("\n🎉 Setup Complete! Your Admin Backend is ready to run.");
  console.log("\n📋 Next Steps:");
  console.log("1. Start MongoDB (if not already running)");
  console.log("2. Run: npm start");
  console.log("3. Test the API endpoints");
  console.log("4. Check the health endpoint: http://localhost:5001/api/health");
  
  console.log("\n🔗 API Endpoints:");
  console.log("- Health Check: GET /api/health");
  console.log("- Login: POST /api/auth/login");
  console.log("- Verify Token: GET /api/auth/verify");
  console.log("- Admin Dashboard: GET /api/admin/dashboard/stats");
  
  console.log("\n📚 Documentation: http://localhost:5001/api/docs");
};

// Run the setup
runSetup().catch(console.error);
