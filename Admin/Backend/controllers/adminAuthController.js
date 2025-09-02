const User = require("../../Backend/models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password, userType = "admin" } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    // Validate userType for admin backend
    if (userType !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. This endpoint is for admin users only.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials.",
      });
    }

    // Check if user is admin or super_admin
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
      });
    }

    // Check if user is active
    if (!user.isActive || user.status === "Inactive") {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials.",
      });
    }

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
      lastActive: user.lastActive,
      averageScore: user.averageScore,
      totalQuizzes: user.totalQuizzes,
      studentsReached: user.studentsReached,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
};

exports.verify = async (req, res) => {
  try {
    // User is already authenticated via middleware
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please login first.",
      });
    }

    // Get fresh user data from database
    const freshUser = await User.findById(user.id).select("-password");

    if (!freshUser) {
      return res.status(401).json({
        success: false,
        error: "User not found.",
      });
    }

    // Check if user is still active
    if (!freshUser.isActive || freshUser.status === "Inactive") {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated.",
      });
    }

    // Update last active
    freshUser.lastActive = new Date();
    await freshUser.save();

    res.status(200).json({
      success: true,
      message: "Token verified successfully",
      user: freshUser,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      error: "Token verification failed.",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the logout action
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed.",
    });
  }
};
