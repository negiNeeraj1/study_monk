const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

/**
 * Comprehensive Security Middleware
 * Provides multiple layers of security for the application
 */

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error:
        message || "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error:
          message || "Too many requests from this IP, please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// General API rate limiting
const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  "Too many API requests from this IP, please try again later."
);

// Authentication rate limiting (stricter)
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  50, // limit each IP to 50 auth requests per windowMs (increased for testing)
  "Too many authentication attempts from this IP, please try again later."
);

// File upload rate limiting
const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 uploads per hour
  "Too many file uploads from this IP, please try again later."
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000", // Main frontend
      "http://localhost:3001", // Admin frontend
      "http://localhost:5173", // Vite dev server
      "https://study-monk-frontend.onrender.com", // Deployed frontend
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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
    "X-API-Key",
  ],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  maxAge: 86400, // 24 hours
};

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://generativelanguage.googleapis.com",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    // Log based on status code
    if (res.statusCode >= 400) {
      console.error("❌ Request Error:", logData);
    } else if (res.statusCode >= 300) {
      console.warn("⚠️ Request Redirect:", logData);
    } else {
      console.log("✅ Request Success:", logData);
    }
  });

  next();
};

// IP address extraction middleware
const extractIP = (req, res, next) => {
  // Get IP from various sources
  req.ip =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    "unknown";

  next();
};

// Request size validation middleware
const validateRequestSize = (maxSize = "10mb") => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers["content-length"] || "0");
    const maxSizeBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        error: `Request entity too large. Maximum size allowed is ${maxSize}.`,
      });
    }

    next();
  };
};

// File type validation middleware
const validateFileType = (
  allowedTypes = ["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png"]
) => {
  return (req, res, next) => {
    if (!req.file) return next();

    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      });
    }

    next();
  };
};

// SQL injection prevention middleware
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
  ];

  const checkValue = (value) => {
    if (typeof value === "string") {
      return sqlPatterns.some((pattern) => pattern.test(value));
    }
    return false;
  };

  // Check request body
  if (req.body && typeof req.body === "object") {
    const hasSQLInjection = Object.values(req.body).some(checkValue);
    if (hasSQLInjection) {
      return res.status(400).json({
        success: false,
        error: "Invalid input detected",
      });
    }
  }

  // Check query parameters
  if (req.query && typeof req.query === "object") {
    const hasSQLInjection = Object.values(req.query).some(checkValue);
    if (hasSQLInjection) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
      });
    }
  }

  next();
};

// Error handling for security middleware
const securityErrorHandler = (err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "CORS policy violation",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error: "Request entity too large",
    });
  }

  next(err);
};

// Apply all security middleware
const applySecurityMiddleware = (app) => {
  // Basic security headers
  app.use(securityHeaders);

  // CORS
  app.use(cors(corsOptions));

  // Rate limiting
  app.use("/api/", apiRateLimit);
  app.use("/api/auth/", authRateLimit);
  app.use("/api/upload/", uploadRateLimit);

  // Request parsing security
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Security middleware
  app.use(mongoSanitize()); // Prevent NoSQL injection
  app.use(xss()); // Prevent XSS attacks
  app.use(hpp()); // Prevent HTTP Parameter Pollution

  // Custom middleware
  app.use(extractIP);
  app.use(requestLogger);
  app.use(preventSQLInjection);
  app.use(validateRequestSize("10mb"));

  // Error handling
  app.use(securityErrorHandler);
};

module.exports = {
  // Individual middleware functions
  apiRateLimit,
  authRateLimit,
  uploadRateLimit,
  corsOptions,
  securityHeaders,
  requestLogger,
  extractIP,
  validateRequestSize,
  validateFileType,
  preventSQLInjection,
  securityErrorHandler,

  // Combined middleware application
  applySecurityMiddleware,

  // Export for use in other files
  createRateLimit,
};
