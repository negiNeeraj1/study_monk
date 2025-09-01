const express = require("express");
const router = express.Router();
const { 
  signup, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  logout, 
  refreshToken 
} = require("../controllers/authController");
const { auth, optionalAuth } = require("../middleware/auth");
const { hasPermission } = require("../middleware/rbac");

// Public routes (no authentication required)
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.post("/logout", auth, logout);
router.post("/refresh", auth, refreshToken);

// Optional auth routes (work with or without authentication)
router.get("/verify", optionalAuth, (req, res) => {
  if (req.isAuthenticated) {
    res.json({
      success: true,
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
      user: null
    });
  }
});

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth service is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
