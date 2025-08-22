#!/usr/bin/env node

/**
 * 🔧 Simple Admin User Creation
 * Creates admin user with improved connection handling
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");
const User = require("../models/User");

const createAdminUser = async () => {
  let connection = null;

  try {
    console.log("🔧 Creating admin user for dashboard access...\n");

    // Connect with timeout settings
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/study-ai";

    console.log("📍 Connecting to:", mongoUri.replace(/:[^:]*@/, ":****@"));

    connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 10000, // 10 second timeout
    });

    console.log("✅ Connected to MongoDB");
    console.log("📊 Database:", mongoose.connection.db.databaseName);

    // Wait for connection to be ready
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once("connected", resolve);
      }
    });

    console.log("🔍 Checking for existing admin user...");

    // Check if admin user exists with a timeout
    let existingAdmin;
    try {
      existingAdmin = await User.findOne({
        email: "admin@example.com",
      }).maxTimeMS(5000);
    } catch (findError) {
      console.log("⚠️  Find operation failed, assuming no existing user");
      existingAdmin = null;
    }

    if (existingAdmin) {
      console.log("👑 Admin user already exists!");
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);

      // Update role to admin if needed
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("✅ Updated user role to admin");
      }
    } else {
      console.log("🆕 Creating new admin user...");

      // Create new admin user
      const adminUser = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });

      await adminUser.save();
      console.log("✅ Admin user created successfully!");
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    console.log("\n🔑 Admin Dashboard Login Credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");

    console.log("\n📝 Next Steps:");
    console.log("1. Start your backend server: npm start");
    console.log(
      "2. Start your admin frontend: cd ../Admin/Frontend && npm run dev"
    );
    console.log("3. Login at http://localhost:3001");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);

    if (error.message.includes("timeout")) {
      console.log("\n💡 Timeout Fix Options:");
      console.log("1. Check if MongoDB service is running");
      console.log("2. Restart MongoDB service");
      console.log("3. Try: net start MongoDB (Windows)");
      console.log("4. Or use MongoDB Compass to verify connection");
    }
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log("\n🔌 Database connection closed");
    }
  }
};

createAdminUser();
