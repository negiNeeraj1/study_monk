import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.name}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              Student
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Full Name
                  </span>
                  <p className="text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Email Address
                  </span>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Member Since
                  </span>
                  <p className="text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Learning Statistics
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Quizzes Completed
                  </span>
                  <p className="text-gray-900">{user?.totalQuizzes || 0}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Average Score
                  </span>
                  <p className="text-gray-900">{user?.averageScore || 0}%</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Last Active
                  </span>
                  <p className="text-gray-900">
                    {new Date(user?.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
