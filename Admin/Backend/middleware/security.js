const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const SystemLog = require("../models/SystemLog");

// Rate limiting for admin routes
exports.adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use handler instead of deprecated onLimitReached
  handler: async (req, res, next, options) => {
    try {
      await SystemLog.create({
        level: "warn",
        message: "Rate limit exceeded for admin routes",
        module: "security",
        action: "rate-limit-exceeded",
        userId: req.user?.id || null,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        metadata: {
          route: req.path,
          method: req.method,
          limit: options.max,
          windowMs: options.windowMs,
        },
      });
    } catch (error) {
      console.error("Failed to log rate limit violation:", error);
    }

    res.status(options.statusCode).json(options.message);
  },
});

// Stricter rate limiting for sensitive operations
exports.sensitiveOperationsLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 sensitive operations per hour
  message: {
    success: false,
    message: "Too many sensitive operations. Please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
exports.securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Request logging middleware
exports.requestLogger = async (req, res, next) => {
  // Don't log health checks and static assets
  if (req.path === "/api/health" || req.path.startsWith("/static/")) {
    return next();
  }

  const startTime = Date.now();

  // Override the end method to log when response is sent
  const originalEnd = res.end;
  res.end = function (...args) {
    const executionTime = Date.now() - startTime;

    // Log the request
    SystemLog.create({
      level: res.statusCode >= 400 ? "warn" : "info",
      message: `${req.method} ${req.path} - ${res.statusCode}`,
      module: "api",
      action: "request",
      userId: req.user?.id || null,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestData: {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: {
          "content-type": req.get("Content-Type"),
          "content-length": req.get("Content-Length"),
        },
      },
      responseData: {
        statusCode: res.statusCode,
        contentLength: res.get("Content-Length"),
      },
      executionTime,
      metadata: {
        timestamp: new Date(),
      },
    }).catch((err) => console.error("Failed to log request:", err));

    originalEnd.apply(this, args);
  };

  next();
};

// IP whitelist middleware (optional - for extra security)
exports.ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No IP restrictions
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (!allowedIPs.includes(clientIP)) {
      SystemLog.create({
        level: "error",
        message: `Blocked request from unauthorized IP: ${clientIP}`,
        module: "security",
        action: "ip-blocked",
        ip: clientIP,
        userAgent: req.get("User-Agent"),
        metadata: {
          route: req.path,
          method: req.method,
          allowedIPs: allowedIPs.length,
        },
      }).catch((err) => console.error("Failed to log IP block:", err));

      return res.status(403).json({
        success: false,
        message: "Access denied from this IP address",
      });
    }

    next();
  };
};

// Detect suspicious patterns middleware
exports.suspiciousActivityDetector = async (req, res, next) => {
  try {
    const clientIP = req.ip;
    const userAgent = req.get("User-Agent");
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Check for suspicious patterns in the last 5 minutes
    const recentLogs = await SystemLog.find({
      ip: clientIP,
      createdAt: { $gte: fiveMinutesAgo },
      level: { $in: ["warn", "error"] },
    }).countDocuments();

    // If more than 10 warnings/errors from same IP in 5 minutes
    if (recentLogs > 10) {
      await SystemLog.create({
        level: "error",
        message: `Suspicious activity detected from IP: ${clientIP}`,
        module: "security",
        action: "suspicious-activity",
        ip: clientIP,
        userAgent: userAgent,
        metadata: {
          recentErrors: recentLogs,
          timeWindow: "5 minutes",
          route: req.path,
          method: req.method,
        },
      });

      return res.status(429).json({
        success: false,
        message: "Suspicious activity detected. Access temporarily restricted.",
      });
    }

    next();
  } catch (error) {
    console.error("Suspicious activity detector error:", error);
    next(); // Continue even if detection fails
  }
};

// CORS configuration for admin panel
exports.adminCors = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In production, replace with your actual admin frontend domain
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001", 
      "http://localhost:5173",
      "http://localhost:4173",
      "https://study-monk-admin-frontend.onrender.com", // Deployed admin frontend
      process.env.ADMIN_FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      SystemLog.create({
        level: "warn",
        message: `CORS blocked request from origin: ${origin}`,
        module: "security",
        action: "cors-blocked",
        metadata: {
          origin,
          allowedOrigins: allowedOrigins.length,
        },
      }).catch((err) => console.error("Failed to log CORS block:", err));

      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

// Error handling for security middleware
exports.securityErrorHandler = (err, req, res, next) => {
  // Log security-related errors
  if (err.message.includes("CORS") || err.message.includes("rate limit")) {
    SystemLog.create({
      level: "error",
      message: `Security error: ${err.message}`,
      module: "security",
      action: "security-error",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      errorStack: err.stack,
      metadata: {
        route: req.path,
        method: req.method,
      },
    }).catch((logErr) =>
      console.error("Failed to log security error:", logErr)
    );
  }

  // Pass to next error handler
  next(err);
};
