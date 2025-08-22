import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Calendar, Save, Eye } from "lucide-react";

const UserModal = ({ mode, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    status: "Active",
    phone: "",
    location: "",
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && mode !== 'create') {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "Student",
        status: user.status || "Active",
        phone: user.phone || "",
        location: user.location || "",
        joinDate: user.joinDate || new Date().toISOString().split('T')[0]
      });
    }
  }, [user, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const roles = [
    { value: "Student", label: "Student" },
    { value: "Premium Student", label: "Premium Student" },
    { value: "Instructor", label: "Instructor" }
  ];

  const statuses = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" }
  ];

  const isViewMode = mode === 'view';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                {isViewMode ? (
                  <Eye size={20} className="text-white" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {mode === 'create' ? 'Create New User' : 
                   mode === 'edit' ? 'Edit User' : 'User Details'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'create' ? 'Add a new user to the platform' :
                   mode === 'edit' ? 'Update user information' : 'View user information'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* User Avatar Section */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">
                  {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : 'U'}
                </span>
              </div>
              {!isViewMode && (
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change Avatar
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                    errors.name ? 'border-red-500' : 'border-gray-200/50 dark:border-gray-700/50'
                  } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-gray-200/50 dark:border-gray-700/50'
                  } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                    isViewMode ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                    isViewMode ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                    isViewMode ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                  placeholder="Enter phone number"
                />
              </div>

              {/* Join Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Join Date
                </label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleChange('joinDate', e.target.value)}
                  disabled={isViewMode || mode === 'edit'}
                  className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                    isViewMode || mode === 'edit' ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={isViewMode}
                className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                  isViewMode ? 'cursor-not-allowed opacity-60' : ''
                }`}
                placeholder="Enter location"
              />
            </div>

            {/* Additional Info for View Mode */}
            {isViewMode && user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                {user.coursesEnrolled && (
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {user.coursesEnrolled}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Courses Enrolled
                    </div>
                  </div>
                )}
                {user.completionRate && (
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {user.completionRate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completion Rate
                    </div>
                  </div>
                )}
                {user.totalQuizzes && (
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {user.totalQuizzes}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Quizzes Taken
                    </div>
                  </div>
                )}
                {user.averageScore && (
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {user.averageScore}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Average Score
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-all duration-200"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </motion.button>
              
              {!isViewMode && (
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <Save size={16} />
                  <span>{mode === 'create' ? 'Create User' : 'Save Changes'}</span>
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserModal;
