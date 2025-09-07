const jwt = require("jsonwebtoken");
const User = require("../models/User");

// User authentication middleware (for regular users, not admin)
const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Access token required. Please login first." 
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token format" 
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false,
          message: "Token expired. Please login again." 
        });
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          success: false,
          message: "Invalid token. Please login again." 
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: "Token verification failed" 
        });
      }
    }

    // Check if token has required fields
    if (!decoded.id || !decoded.email || !decoded.role) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token structure" 
      });
    }

    // Find user in database
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found. Please login again." 
      });
    }

    // Check if user is active
    if (!user.isActive || user.status !== "Active") {
      return res.status(401).json({ 
        success: false,
        message: "Account is deactivated. Please contact administrator." 
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        success: false,
        message: "Account is temporarily locked due to multiple failed login attempts. Please try again later." 
      });
    }

    // Verify token role matches user role
    if (decoded.role !== user.role) {
      return res.status(401).json({ 
        success: false,
        message: "Token role mismatch. Please login again." 
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Add user info to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("User authentication middleware error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Authentication failed. Please try again." 
    });
  }
};

module.exports = { userAuth };
