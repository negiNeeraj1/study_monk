const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 🔐 Enhanced Authentication Middleware
 * Provides robust token validation with detailed error handling
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: "Access denied. No authorization header provided.",
        code: "NO_AUTH_HEADER"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        error: "Access denied. Invalid authorization format. Use 'Bearer <token>'",
        code: "INVALID_AUTH_FORMAT"
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ 
        success: false,
        error: "Access denied. No token provided.",
        code: "NO_TOKEN"
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: "Token has expired. Please login again.",
          code: "TOKEN_EXPIRED"
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: "Invalid token format.",
          code: "INVALID_TOKEN"
        });
      }
      throw jwtError; // Re-throw unexpected errors
    }

    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: "User not found. Token may be for a deleted user.",
        code: "USER_NOT_FOUND"
      });
    }

    // Check if user account is active (if you have such field)
    if (user.isActive === false) {
      return res.status(401).json({ 
        success: false,
        error: "User account is deactivated.",
        code: "ACCOUNT_DEACTIVATED"
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error("🚨 Authentication middleware error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Authentication service temporarily unavailable.",
      code: "AUTH_SERVICE_ERROR"
    });
  }
};

/**
 * 🔧 Optional Authentication Middleware
 * Allows endpoints to work with or without authentication
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
    
    if (!token || token === "null" || token === "undefined") {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    req.user = user;
    req.isAuthenticated = !!user;
    req.token = token;
    
    next();
  } catch (error) {
    // Don't fail on optional auth errors
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

/**
 * 👑 Admin Role Middleware
 * Requires user to be authenticated and have admin role
 */
const requireAdmin = async (req, res, next) => {
  // First run auth middleware
  auth(req, res, (err) => {
    if (err) return next(err);
    
    // Check admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: "Access denied. Admin privileges required.",
        code: "INSUFFICIENT_PRIVILEGES"
      });
    }
    
    next();
  });
};

/**
 * 📊 Rate Limiting Helper
 * Basic rate limiting per user
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }
    
    const userRequests = requests.get(userId);
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: `Too many requests. Limit: ${maxRequests} per ${windowMs/60000} minutes.`,
        code: "RATE_LIMIT_EXCEEDED"
      });
    }
    
    recentRequests.push(now);
    requests.set(userId, recentRequests);
    
    next();
  };
};

module.exports = { 
  auth, 
  optionalAuth, 
  requireAdmin, 
  userRateLimit,
  // Legacy exports for compatibility
  protect: auth 
};
