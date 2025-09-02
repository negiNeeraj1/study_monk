const jwt = require("jsonwebtoken");
const User = require("../../Backend/models/User");
const SystemLog = require("../models/SystemLog");

// Database health check middleware
const checkDBHealth = async (req, res, next) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database service temporarily unavailable. Please try again.",
      });
    }

    // Test with a simple ping
    try {
      await mongoose.connection.db.admin().ping();
    } catch (pingError) {
      console.error("Database health check failed:", pingError.message);
      return res.status(503).json({
        success: false,
        message: "Database service temporarily unavailable. Please try again.",
      });
    }

    next();
  } catch (error) {
    console.error("Database health check error:", error.message);
    return res.status(503).json({
      success: false,
      message: "Database service temporarily unavailable. Please try again.",
    });
  }
};

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
};

// Combined middleware for admin routes
const adminAuth = [checkDBHealth, verifyToken];

// Optional admin auth (for routes that can be accessed by both admin and regular users)
const optionalAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      req.isAdmin = false;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
      req.isAdmin = user.role === "admin" || user.role === "super_admin";
    } else {
      req.user = null;
      req.isAdmin = false;
    }

    next();
  } catch (error) {
    req.user = null;
    req.isAdmin = false;
    next();
  }
};

// Log admin actions
const logAdminAction = (action, module) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after response
    res.send = function (data) {
      // Log the action
      SystemLog.create({
        level: "info",
        message: `Admin action: ${action}`,
        module: module,
        action: action,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        requestData: {
          method: req.method,
          path: req.path,
          query: req.query,
          params: req.params,
        },
        responseData: {
          statusCode: res.statusCode,
        },
        metadata: {
          timestamp: new Date(),
        },
      }).catch((err) => console.error("Failed to log admin action:", err));

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  verifyToken,
  checkDBHealth,
  adminAuth,
  optionalAdmin,
  logAdminAction,
};
