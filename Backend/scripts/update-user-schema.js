const mongoose = require("mongoose");
const User = require("../models/User");

// Load environment variables
require("dotenv").config();

const updateUserSchema = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/study-ai";
    console.log("Connecting to MongoDB:", mongoUri);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");

    // Update all existing users with new fields
    const result = await User.updateMany(
      {},
      {
        $set: {
          status: "Active",
          lastActive: new Date(),
          averageScore: Math.floor(Math.random() * 100), // Random score for demo
          totalQuizzes: Math.floor(Math.random() * 10),
          studentsReached: Math.floor(Math.random() * 50),
          isActive: true,
        },
      }
    );

    console.log(
      `✅ Updated ${result.modifiedCount} users with new schema fields`
    );

    // Show updated users
    const users = await User.find({}).select("-password");
    console.log("📊 Updated users:", users);

    process.exit(0);
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  }
};

updateUserSchema();
