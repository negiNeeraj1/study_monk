const express = require("express");
const router = express.Router();
const { login, verify, logout } = require("../controllers/adminAuthController");
const { adminAuth } = require("../middleware/adminAuth");

// Public routes (no authentication required)
router.post("/login", login);

// Protected routes (authentication required)
router.get("/verify", adminAuth, verify);
router.post("/logout", adminAuth, logout);

module.exports = router;
