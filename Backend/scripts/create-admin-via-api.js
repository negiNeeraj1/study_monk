#!/usr/bin/env node

/**
 * 🔧 Create Admin User via API
 * Alternative method using the backend API
 */

const axios = require("axios");

const createAdminViaAPI = async () => {
  try {
    console.log("🔧 Creating admin user via API...\n");

    const baseURL = "http://localhost:5000/api";

    // First check if server is running
    try {
      await axios.get(`${baseURL}/health`);
      console.log("✅ Backend server is running");
    } catch (error) {
      console.log("❌ Backend server is not running on port 5000");
      console.log("🚀 Please start your backend first: npm start");
      return;
    }

    // Try to create admin user via signup
    console.log("🆕 Creating admin user...");

    const adminData = {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
    };

    try {
      const response = await axios.post(`${baseURL}/auth/signup`, adminData);

      if (response.data.token) {
        console.log("✅ Admin user created successfully!");
        console.log(`   Name: ${response.data.user.name}`);
        console.log(`   Email: ${response.data.user.email}`);
        console.log(`   Role: ${response.data.user.role}`);

        // Note: You may need to manually update the role to 'admin' in your database
        if (response.data.user.role !== "admin") {
          console.log(
            '⚠️  Note: User role is not "admin" - you may need to update this manually in your database'
          );
        }
      }
    } catch (signupError) {
      if (signupError.response?.data?.error?.includes("already in use")) {
        console.log("👑 Admin user already exists!");

        // Try to login to verify
        try {
          const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: "admin@example.com",
            password: "admin123",
          });

          console.log("✅ Login successful");
          console.log(`   Name: ${loginResponse.data.user.name}`);
          console.log(`   Email: ${loginResponse.data.user.email}`);
          console.log(`   Role: ${loginResponse.data.user.role}`);

          if (loginResponse.data.user.role !== "admin") {
            console.log('⚠️  User exists but role is not "admin"');
            console.log(
              "📝 You need to manually update the role in your database:"
            );
            console.log(
              '   db.users.updateOne({email:"admin@example.com"}, {$set:{role:"admin"}})'
            );
          }
        } catch (loginError) {
          console.log(
            "❌ Login failed:",
            loginError.response?.data?.error || loginError.message
          );
        }
      } else {
        console.log(
          "❌ Signup failed:",
          signupError.response?.data?.error || signupError.message
        );
      }
    }

    console.log("\n🔑 Admin Dashboard Login Credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
    console.log("   URL: http://localhost:3001");

    console.log("\n📝 Next Steps:");
    console.log("1. Make sure backend is running: npm start");
    console.log("2. Start admin frontend: cd ../Admin/Frontend && npm run dev");
    console.log("3. Login with the credentials above");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

createAdminViaAPI();



