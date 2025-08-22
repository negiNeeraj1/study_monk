#!/usr/bin/env node

/**
 * 🧪 Test MongoDB Atlas Connection
 * Quick test to verify your Atlas connection works
 */

require("dotenv").config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    console.log("🔗 Testing MongoDB Atlas connection...\n");

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log(
      "📍 Connection URI:",
      mongoUri ? mongoUri.replace(/:[^:]*@/, ":****@") : "NOT SET"
    );

    if (!mongoUri || mongoUri.includes("YOUR_USERNAME")) {
      console.log("❌ MongoDB URI not properly configured!");
      console.log(
        "📝 Please update your .env file with your Atlas connection string"
      );
      return;
    }

    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Successfully connected to MongoDB Atlas!");
    console.log("📊 Database name:", mongoose.connection.db.databaseName);

    // Test a simple operation
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📁 Found ${collections.length} collections in database`);

    mongoose.connection.close();
    console.log("\n🎉 MongoDB Atlas connection test successful!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("\n💡 Common fixes:");
    console.log("1. Check your username and password in the connection string");
    console.log("2. Whitelist your IP address in Atlas Network Access");
    console.log("3. Make sure your cluster is running");
    console.log("4. Verify the database name is correct");
  }
};

testConnection();


