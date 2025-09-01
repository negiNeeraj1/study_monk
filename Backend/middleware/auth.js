const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ROLES } = require("../models/User");

/**
 * Enhanced Authentication Middleware
 * Provides secure JWT verification with additional security features
 */

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        error: "Access token required. Please login first." 
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid token format" 
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
          error: "Token expired. Please login again." 
        });
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          success: false,
          error: "Invalid token. Please login again." 
        });
      } else {
        return res.status(401).json({ 
          success: false,
          error: "Token verification failed" 
        });
      }
    }

    // Check if token has required fields
    if (!decoded.id || !decoded.email || !decoded.role) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid token structure" 
      });
    }

    // Find user in database
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: "User not found. Please login again." 
      });
    }

    // Check if user is active
    if (!user.isActive || user.status !== "Active") {
      return res.status(401).json({ 
        success: false,
        error: "Account is deactivated. Please contact administrator." 
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        success: false,
        error: "Account is temporarily locked due to multiple failed login attempts. Please try again later." 
      });
    }

    // Verify token role matches user role
    if (decoded.role !== user.role) {
      return res.status(401).json({ 
        success: false,
        error: "Token role mismatch. Please login again." 
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Add user info to request
    req.user = user;
    req.token = token;

    // Add role-based helper methods to request
    req.isAdmin = () => user.isAtLeastRole(ROLES.ADMIN);
    req.isInstructor = () => user.isAtLeastRole(ROLES.INSTRUCTOR);
    req.isUser = () => user.role === ROLES.USER;
    req.hasPermission = (permission) => user.hasPermission(permission);
    req.hasRole = (role) => user.hasRole(role);
    req.isAtLeastRole = (role) => user.isAtLeastRole(role);

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Authentication failed. Please try again." 
    });
  }
};

/**
 * Optional Authentication Middleware
 * Allows routes to work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    // Try to verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (user && user.isActive && user.status === "Active" && !user.isLocked) {
        req.user = user;
        req.isAuthenticated = true;
        req.token = token;
        
        // Add helper methods
        req.isAdmin = () => user.isAtLeastRole(ROLES.ADMIN);
        req.isInstructor = () => user.isAtLeastRole(ROLES.INSTRUCTOR);
        req.isUser = () => user.role === ROLES.USER;
        req.hasPermission = (permission) => user.hasPermission(permission);
        req.hasRole = (role) => user.hasRole(role);
        req.isAtLeastRole = (role) => user.isAtLeastRole(role);
      } else {
        req.user = null;
        req.isAuthenticated = false;
      }
    } catch (jwtError) {
      req.user = null;
      req.isAuthenticated = false;
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

/**
 * Admin-only Authentication Middleware
 */
const adminAuth = async (req, res, next) => {
  try {
    // First authenticate the user
    await auth(req, res, async (err) => {
      if (err) return next(err);
      
      // Check if user has admin privileges
      if (!req.user.isAtLeastRole(ROLES.ADMIN)) {
        return res.status(403).json({ 
          success: false,
          error: "Admin access required. Insufficient privileges." 
        });
      }
      
      next();
    });
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Admin authentication failed" 
    });
  }
};

/**
 * Instructor or Admin Authentication Middleware
 */
const instructorOrAdminAuth = async (req, res, next) => {
  try {
    // First authenticate the user
    await auth(req, res, async (err) => {
      if (err) return next(err);
      
      // Check if user has instructor or admin privileges
      if (!req.user.isAtLeastRole(ROLES.INSTRUCTOR)) {
        return res.status(403).json({ 
          success: false,
          error: "Instructor or admin access required. Insufficient privileges." 
        });
      }
      
      next();
    });
  } catch (error) {
    console.error("Instructor/Admin auth middleware error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Authentication failed" 
    });
  }
};

/**
 * Rate Limiting for Authentication
 */
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: "Too many authentication attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Logout Middleware (for tracking purposes)
 */
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      // Log logout action
      console.log(`User ${req.user.email} logged out at ${new Date().toISOString()}`);
      
      // Update last active
      req.user.lastActive = new Date();
      await req.user.save();
    }
    next();
  } catch (error) {
    console.error("Logout middleware error:", error);
    next(); // Don't block logout on error
  }
};

module.exports = { 
  auth, 
  protect: auth,
  optionalAuth,
  adminAuth,
  instructorOrAdminAuth,
  authRateLimit,
  logout
};
