const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define role hierarchy and permissions
const ROLES = {
  USER: "user",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

const PERMISSIONS = {
  // User permissions
  USER: [
    "read:own_profile",
    "update:own_profile",
    "read:study_materials",
    "take:quizzes",
    "read:own_quiz_results",
  ],

  // Instructor permissions
  INSTRUCTOR: [
    "read:own_profile",
    "update:own_profile",
    "read:study_materials",
    "create:study_materials",
    "update:own_study_materials",
    "delete:own_study_materials",
    "create:quizzes",
    "update:own_quizzes",
    "delete:own_quizzes",
    "read:quiz_attempts",
    "read:analytics",
  ],

  // Admin permissions
  ADMIN: [
    "read:all_profiles",
    "update:all_profiles",
    "delete:users",
    "manage:study_materials",
    "manage:quizzes",
    "manage:notifications",
    "read:all_analytics",
    "manage:system_settings",
  ],

  // Super Admin permissions
  SUPER_ADMIN: [
    "manage:admins",
    "manage:system_config",
    "access:logs",
    "manage:backups",
    "full_access",
  ],
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: Object.values(PERMISSIONS).flat(),
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Pending"],
      default: "Active",
    },
    lastActive: { type: Date, default: Date.now },
    averageScore: { type: Number, default: 0, min: 0, max: 100 },
    totalQuizzes: { type: Number, default: 0, min: 0 },
    studentsReached: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    profilePicture: { type: String, default: "" },
    bio: { type: String, maxlength: 500 },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "auto"], default: "auto" },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: "en" },
    },
    metadata: {
      registrationSource: { type: String, default: "web" },
      lastLoginIP: String,
      deviceInfo: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastActive: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.name}`;
});

// Virtual for isLocked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // Hash password with salt rounds of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware for setting permissions based on role
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    this.permissions = PERMISSIONS[this.role.toUpperCase()] || PERMISSIONS.USER;
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

userSchema.methods.hasPermission = function (permission) {
  return (
    this.permissions.includes(permission) ||
    this.permissions.includes("full_access")
  );
};

userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

userSchema.methods.isAtLeastRole = function (role) {
  const roleHierarchy = [
    ROLES.USER,
    ROLES.INSTRUCTOR,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
  ];
  const userRoleIndex = roleHierarchy.indexOf(this.role);
  const requiredRoleIndex = roleHierarchy.indexOf(role);
  return userRoleIndex >= requiredRoleIndex;
};

userSchema.methods.incrementLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({
    isActive: true,
    status: "Active",
    lockUntil: { $exists: false },
  });
};

// Create the model
const User = mongoose.model("User", userSchema);

// Export constants for use in other files
User.ROLES = ROLES;
User.PERMISSIONS = PERMISSIONS;

module.exports = User;
