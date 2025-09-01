const User = require("../models/User");
const { ROLES, PERMISSIONS } = require("../models/User");

/**
 * RBAC Middleware for Role-Based Access Control
 * Provides comprehensive permission checking and role validation
 */

// Check if user has specific role
const hasRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      if (!Object.values(ROLES).includes(requiredRole)) {
        return res.status(500).json({
          success: false,
          error: "Invalid role configuration"
        });
      }

      if (req.user.role === requiredRole) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Access denied. ${requiredRole} role required.`
      });
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        error: "Role verification failed"
      });
    }
  };
};

// Check if user has at least the required role (hierarchical)
const hasAtLeastRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      if (!Object.values(ROLES).includes(requiredRole)) {
        return res.status(500).json({
          success: false,
          error: "Invalid role configuration"
        });
      }

      if (req.user.isAtLeastRole(requiredRole)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Access denied. ${requiredRole} or higher role required.`
      });
    } catch (error) {
      console.error("Role hierarchy check error:", error);
      return res.status(500).json({
        success: false,
        error: "Role verification failed"
      });
    }
  };
};

// Check if user has specific permission
const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      if (!Object.values(PERMISSIONS).flat().includes(requiredPermission)) {
        return res.status(500).json({
          success: false,
          error: "Invalid permission configuration"
        });
      }

      if (req.user.hasPermission(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Access denied. ${requiredPermission} permission required.`
      });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        error: "Permission verification failed"
      });
    }
  };
};

// Check if user has any of the required permissions
const hasAnyPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      if (!Array.isArray(requiredPermissions)) {
        return res.status(500).json({
          success: false,
          error: "Invalid permissions configuration"
        });
      }

      const hasAny = requiredPermissions.some(permission => 
        req.user.hasPermission(permission)
      );

      if (hasAny) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Access denied. One of the following permissions required: ${requiredPermissions.join(", ")}`
      });
    } catch (error) {
      console.error("Any permission check error:", error);
      return res.status(500).json({
        success: false,
        error: "Permission verification failed"
      });
    }
  };
};

// Check if user has all required permissions
const hasAllPermissions = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      if (!Array.isArray(requiredPermissions)) {
        return res.status(500).json({
          success: false,
          error: "Invalid permissions configuration"
        });
      }

      const hasAll = requiredPermissions.every(permission => 
        req.user.hasPermission(permission)
      );

      if (hasAll) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Access denied. All of the following permissions required: ${requiredPermissions.join(", ")}`
      });
    } catch (error) {
      console.error("All permissions check error:", error);
      return res.status(500).json({
        success: false,
        error: "Permission verification failed"
      });
    }
  };
};

// Resource ownership check middleware
const isOwner = (resourceModel, resourceIdField = "id") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: "Resource ID required"
        });
      }

      // If user is admin or super_admin, allow access
      if (req.user.isAtLeastRole(ROLES.ADMIN)) {
        return next();
      }

      // Check if user owns the resource
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found"
        });
      }

      // Check if user is the owner (assuming resource has userId field)
      if (resource.userId && resource.userId.toString() === req.user._id.toString()) {
        return next();
      }

      // Check if user is the creator (assuming resource has createdBy field)
      if (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: "Access denied. You can only modify your own resources."
      });
    } catch (error) {
      console.error("Resource ownership check error:", error);
      return res.status(500).json({
        success: false,
        error: "Resource ownership verification failed"
      });
    }
  };
};

// Dynamic permission check based on request parameters
const dynamicPermissionCheck = (permissionResolver) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      const requiredPermission = permissionResolver(req);
      
      if (!requiredPermission) {
        return next(); // No permission required
      }

      if (req.user.hasPermission(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Access denied. ${requiredPermission} permission required.`
      });
    } catch (error) {
      console.error("Dynamic permission check error:", error);
      return res.status(500).json({
        success: false,
        error: "Permission verification failed"
      });
    }
  };
};

// Role-based route protection
const protectRoute = (options = {}) => {
  const {
    roles = [],
    permissions = [],
    anyRole = false,
    anyPermission = false,
    ownerCheck = false,
    resourceModel = null
  } = options;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }

      // Check roles
      if (roles.length > 0) {
        if (anyRole) {
          // User must have at least one of the required roles
          const hasRole = roles.some(role => req.user.hasRole(role));
          if (!hasRole) {
            return res.status(403).json({
              success: false,
              error: `Access denied. One of the following roles required: ${roles.join(", ")}`
            });
          }
        } else {
          // User must have all required roles
          const hasAllRoles = roles.every(role => req.user.hasRole(role));
          if (!hasAllRoles) {
            return res.status(403).json({
              success: false,
              error: `Access denied. All of the following roles required: ${roles.join(", ")}`
            });
          }
        }
      }

      // Check permissions
      if (permissions.length > 0) {
        if (anyPermission) {
          // User must have at least one of the required permissions
          const hasPermission = permissions.some(permission => req.user.hasPermission(permission));
          if (!hasPermission) {
            return res.status(403).json({
              success: false,
              error: `Access denied. One of the following permissions required: ${permissions.join(", ")}`
            });
          }
        } else {
          // User must have all required permissions
          const hasAllPermissions = permissions.every(permission => req.user.hasPermission(permission));
          if (!hasAllPermissions) {
            return res.status(403).json({
              success: false,
              error: `Access denied. All of the following permissions required: ${permissions.join(", ")}`
            });
          }
        }
      }

      // Check resource ownership if required
      if (ownerCheck && resourceModel) {
        const resourceId = req.params.id || req.body.id;
        if (resourceId) {
          const resource = await resourceModel.findById(resourceId);
          if (resource && resource.userId && resource.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
              success: false,
              error: "Access denied. You can only modify your own resources."
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error("Route protection error:", error);
      return res.status(500).json({
        success: false,
        error: "Access verification failed"
      });
    }
  };
};

// Export all middleware functions
module.exports = {
  hasRole,
  hasAtLeastRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isOwner,
  dynamicPermissionCheck,
  protectRoute,
  ROLES,
  PERMISSIONS
};
