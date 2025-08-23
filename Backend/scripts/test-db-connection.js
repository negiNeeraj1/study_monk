// Database Connection Test Script
// Run this to test your MongoDB connection before deploying

const mongoose = require("mongoose");
require("dotenv").config();

const testConnection = async () => {
  try {
    console.log("🧪 Testing MongoDB Connection...");
    console.log("📍 Environment:", process.env.NODE_ENV || "development");

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("❌ No MongoDB URI found in environment variables");
      console.log("💡 Please set MONGODB_URI or MONGO_URI");
      return;
    }

    console.log(
      "🔌 Connection string:",
      mongoUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
    );

    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Using only supported options for newer MongoDB versions
    };

    console.log("⏳ Connecting...");
    await mongoose.connect(mongoUri, connectionOptions);

    console.log("✅ Connection successful!");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    console.log("🔗 Host:", mongoose.connection.host);
    console.log("🚪 Port:", mongoose.connection.port);

    // Test a simple operation
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("📚 Collections found:", collections.length);

    await mongoose.disconnect();
    console.log("🔌 Disconnected successfully");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("🔍 Full error:", error);

    if (error.name === "MongoNetworkError") {
      console.log("\n💡 Network Error - Check:");
      console.log("   • Internet connection");
      console.log("   • MongoDB Atlas IP whitelist");
      console.log("   • Firewall settings");
    }

    if (error.name === "MongoServerSelectionError") {
      console.log("\n💡 Server Selection Error - Check:");
      console.log("   • MongoDB Atlas cluster status");
      console.log("   • Connection string format");
      console.log("   • Username/password");
    }

    if (error.name === "MongoParseError") {
      console.log("\n💡 Parse Error - Check:");
      console.log("   • Connection string format");
      console.log("   • Special characters in password");
      console.log("   • URL encoding");
    }
  }
};

// Run the test
testConnection();
