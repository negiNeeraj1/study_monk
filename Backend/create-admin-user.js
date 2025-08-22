#!/usr/bin/env node

/**
 * 🔧 Create Admin User Script
 * Creates an admin user for the dashboard
 */

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/study-ai";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    console.log("🔧 Creating admin user for dashboard access...\n");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("👑 Admin user already exists!");
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);

      // Update role to admin if it's not already
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("✅ Updated user role to admin");
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123", // This will be hashed automatically
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
    console.log("2. Start your admin frontend: cd ../Admin/Frontend && npm run dev");
    console.log("3. Login with the credentials above");
    console.log("4. Access the admin dashboard - should work without errors!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createAdminUser();
};

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { createAdminUser };
