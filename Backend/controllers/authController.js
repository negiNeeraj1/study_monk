const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { ROLES, PERMISSIONS } = require("../models/User");

/**
 * Enhanced Authentication Controller
 * Provides secure user registration, login, and account management
 */

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "study-ai-app",
      audience: "study-ai-users",
    }
  );
};

/**
 * User Registration
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, userType = "user" } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required.",
      });
    }

    // Validate userType
    if (userType && !Object.values(ROLES).includes(userType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid user type. Must be one of: ${Object.values(ROLES).join(", ")}`,
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long.",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already in use.",
      });
    }

    // Create user with specified role
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userType,
      permissions: PERMISSIONS[userType.toUpperCase()] || PERMISSIONS.USER,
    });

    // Generate token
    const token = createToken(user);

    // Return user data (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastActive: user.lastActive,
      averageScore: user.averageScore,
      totalQuizzes: user.totalQuizzes,
      studentsReached: user.studentsReached,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("Signup error:", err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already exists.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
    });
  }
};

/**
 * User Login
 */
exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials.",
      });
    }

    // Check if user is active
    if (!user.isActive || user.status !== "Active") {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated. Please contact administrator.",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error:
          "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incrementLoginAttempts();

      return res.status(401).json({
        success: false,
        error: "Invalid credentials.",
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Note: userType is now optional and used only for logging purposes
    // The system will redirect based on the actual user role, not the selected userType

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = createToken(user);

    // Return user data (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastActive: user.lastActive,
      averageScore: user.averageScore,
      totalQuizzes: user.totalQuizzes,
      studentsReached: user.studentsReached,
      preferences: user.preferences,
      permissions: user.permissions,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
};

/**
 * Get Current User Profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to get profile.",
    });
  }
};

/**
 * Update User Profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, preferences } = req.body;
    const updates = {};

    // Only allow updating specific fields
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (preferences !== undefined) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user,
    });
  } catch (err) {
    console.error("Update profile error:", err);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update profile.",
    });
  }
};

/**
 * Change Password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect.",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to change password.",
    });
  }
};

/**
 * Logout (client-side token removal, but we can log it)
 */
exports.logout = async (req, res) => {
  try {
    // Log logout action
    console.log(
      `User ${req.user.email} logged out at ${new Date().toISOString()}`
    );

    // Update last active
    req.user.lastActive = new Date();
    await req.user.save();

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      success: false,
      error: "Logout failed.",
    });
  }
};

/**
 * Refresh Token (optional - for extending session)
 */
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.isActive || user.status !== "Active") {
      return res.status(401).json({
        success: false,
        error: "User not found or inactive.",
      });
    }

    // Generate new token
    const newToken = createToken(user);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to refresh token.",
    });
  }
};
