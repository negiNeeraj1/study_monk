const mongoose = require("mongoose");
const Notification = require("./models/Notification");
const User = require("./models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/study-ai";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const createTestNotification = async () => {
  try {
    // Find a user to be the creator (or create a system user)
    let creator = await User.findOne({ role: "admin" });
    if (!creator) {
      creator = await User.findOne();
    }

    if (!creator) {
      console.log("No users found. Please create a user first.");
      return;
    }

    // Create test notification
    const notification = await Notification.create({
      title: "Welcome to StudyAI!",
      message:
        "Welcome to our platform! Start your learning journey today. This is a test notification to verify the system is working correctly.",
      type: "info",
      priority: "normal",
      recipients: "all",
      scheduledFor: new Date(),
      isActive: true,
      createdBy: creator._id,
      deliveryStats: {
        sent: 1,
        delivered: 1,
        read: 0,
      },
    });

    console.log("✅ Test notification created successfully:");
    console.log("Title:", notification.title);
    console.log("Message:", notification.message);
    console.log("Recipients:", notification.recipients);
    console.log("Created by:", creator.name);
    console.log("Notification ID:", notification._id);

    // Create another test notification for students
    const studentNotification = await Notification.create({
      title: "New Quiz Available!",
      message:
        "A new quiz on JavaScript fundamentals is now available! Test your knowledge and improve your skills.",
      type: "announcement",
      priority: "high",
      recipients: "students",
      scheduledFor: new Date(),
      isActive: true,
      createdBy: creator._id,
      deliveryStats: {
        sent: 1,
        delivered: 1,
        read: 0,
      },
    });

    console.log("\n✅ Student notification created successfully:");
    console.log("Title:", studentNotification.title);
    console.log("Message:", studentNotification.message);
    console.log("Recipients:", studentNotification.recipients);
    console.log("Notification ID:", studentNotification._id);
  } catch (error) {
    console.error("❌ Error creating test notification:", error);
  }
};

const main = async () => {
  await connectDB();
  await createTestNotification();
  await mongoose.connection.close();
  console.log("\n✅ Script completed successfully!");
};

main().catch(console.error);
