import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  Download,
  Upload,
  UserCheck,
  UserX,
  Star,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import adminAPI from "../../services/api";
import UserModal from "./UserModal";
import UserFilters from "./UserFilters";
import UserStats from "./UserStats";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pagination, setPagination] = useState({});

  const { showToast } = useDashboard();

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, [
    currentPage,
    searchTerm,
    selectedRole,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm,
        role: selectedRole !== "all" ? selectedRole : "",
        sortBy,
        sortOrder,
      };

      const response = await adminAPI.getUsers(params);

      if (response.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setTotalUsers(response.data.pagination.count);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteUser(user._id || user.id);
      if (response.success) {
        showToast(`User ${user.name} deleted successfully`, "success");
        loadUsers(); // Reload the list
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToast("Failed to delete user", "error");
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await adminAPI.createUser(userData);
      if (response.success) {
        showToast("User created successfully", "success");
        setShowModal(false);
        loadUsers(); // Reload the list
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      showToast(error.message || "Failed to create user", "error");
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await adminAPI.updateUser(userId, userData);
      if (response.success) {
        showToast("User updated successfully", "success");
        setShowModal(false);
        loadUsers(); // Reload the list
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      showToast(error.message || "Failed to update user", "error");
    }
  };

  // Debounce search term
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadUsers();
      } else {
        setCurrentPage(1); // This will trigger loadUsers
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedRole, selectedStatus, sortBy, sortOrder]);

  // Use API pagination instead of client-side pagination
  const currentUsers = filteredUsers;
  const totalPages = pagination.total || 1;

  const handleUserAction = (action, user) => {
    switch (action) {
      case "view":
        setSelectedUser(user);
        setModalMode("view");
        setShowModal(true);
        break;
      case "edit":
        setSelectedUser(user);
        setModalMode("edit");
        setShowModal(true);
        break;
      case "delete":
        handleDeleteUser(user);
        break;
      case "activate":
        setUsers(
          users.map((u) => (u.id === user.id ? { ...u, status: "Active" } : u))
        );
        showToast(`User ${user.name} activated`, "success");
        break;
      case "deactivate":
        setUsers(
          users.map((u) =>
            u.id === user.id ? { ...u, status: "Inactive" } : u
          )
        );
        showToast(`User ${user.name} deactivated`, "warning");
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      showToast("Please select users first", "warning");
      return;
    }

    switch (action) {
      case "delete":
        if (window.confirm(`Delete ${selectedUsers.length} selected users?`)) {
          setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
          showToast(`${selectedUsers.length} users deleted`, "success");
        }
        break;
      case "activate":
        setUsers(
          users.map((u) =>
            selectedUsers.includes(u.id) ? { ...u, status: "Active" } : u
          )
        );
        setSelectedUsers([]);
        showToast(`${selectedUsers.length} users activated`, "success");
        break;
      case "export":
        showToast("Exporting selected users...", "info");
        // Export logic here
        break;
      default:
        break;
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setModalMode("create");
    setShowModal(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "instructor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all platform users
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter size={18} />
            <span>Filters</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <Plus size={18} />
            <span>Add User</span>
          </motion.button>
        </div>
      </div>

      {/* User Stats */}
      <UserStats users={users} totalCount={totalUsers} />

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedUsers.length} users selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction("activate")}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(
                          currentUsers.map((u) => u._id || u.id)
                        );
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-300">
                        Loading users...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <span className="text-gray-500 dark:text-gray-400">
                      No users found
                    </span>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <motion.tr
                    key={user._id || user.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id || user.id)}
                        onChange={(e) => {
                          const userId = user._id || user.id;
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, userId]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== userId)
                            );
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.averageScore && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.averageScore}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.totalQuizzes} quizzes
                          </div>
                        </div>
                      )}
                      {user.studentsReached && (
                        <div className="flex items-center space-x-2">
                          <TrendingUp size={14} className="text-green-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.studentsReached} students
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.lastActive
                        ? new Date(user.lastActive).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUserAction("view", user)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUserAction("edit", user)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUserAction("delete", user)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * usersPerPage + 1} to{" "}
                {Math.min(currentPage * usersPerPage, totalUsers)} of{" "}
                {totalUsers} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <UserModal
            mode={modalMode}
            user={selectedUser}
            onClose={() => setShowModal(false)}
            onSave={(userData) => {
              if (modalMode === "create") {
                handleCreateUser(userData);
              } else if (modalMode === "edit") {
                handleUpdateUser(selectedUser._id || selectedUser.id, userData);
              }
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserManagement;
