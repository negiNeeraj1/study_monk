const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/study-ai";
    console.log("Connecting to MongoDB:", mongoUri);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000, // Increased from 30000
      socketTimeoutMS: 60000, // Increased from 45000
      connectTimeoutMS: 60000, // Increased from 30000
      maxPoolSize: 10, // Increased from 5
      minPoolSize: 2, // Increased from 1
      bufferCommands: false, // Changed from true to prevent buffering issues
      maxIdleTimeMS: 60000, // Increased from 30000
      heartbeatFrequencyMS: 30000, // Increased from 10000
      retryWrites: true,
      w: "majority",
      // Add connection retry logic
      retryReads: true,
      // Better connection management
      family: 4, // Force IPv4
      // Connection monitoring
      monitorCommands: true,
      // Additional timeout settings
      serverApi: {
        version: "1",
        strict: false,
        deprecationErrors: false,
      },
      // Force immediate connection
      autoIndex: false,
      autoCreate: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Wait for connection to be stable
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Test connection with a simple operation
    try {
      await mongoose.connection.db.admin().ping();
      console.log("✅ Database ping successful");
    } catch (pingError) {
      console.warn("⚠️ Database ping failed:", pingError.message);
    }

    // Log database connection only after connection is fully established
    try {
      const SystemLog = require("../models/SystemLog");
      await SystemLog.create({
        level: "info",
        message: "Database connection established",
        module: "database",
        action: "connect",
        metadata: {
          host: conn.connection.host,
          database: conn.connection.name,
          timestamp: new Date(),
        },
      });
      console.log("✅ Database connection logged successfully");
    } catch (logError) {
      console.warn("⚠️ Failed to log database connection:", logError.message);
    }

    return conn;
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Add connection health monitoring
mongoose.connection.on("reconnected", () => {
  console.log("Mongoose reconnected to MongoDB");
});

mongoose.connection.on("close", () => {
  console.log("Mongoose connection closed");
});

// Connection health check function
const checkConnectionHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Connection health check failed:", error.message);
    return false;
  }
};

// Export health check function
module.exports.checkConnectionHealth = checkConnectionHealth;

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("Error during database shutdown:", error);
    process.exit(1);
  }
});

module.exports = connectDB;
