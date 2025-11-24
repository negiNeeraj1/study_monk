// Admin Panel API Service
const API_BASE_URL = "https://study-monk-admin-backend.onrender.com/api";

class AdminAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    // Try both possible token keys for compatibility
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  }

  // Create headers with auth token
  getHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      const token = this.getAuthToken();

      // Check if token exists for protected routes
      if (
        !token &&
        !endpoint.includes("/health") &&
        !endpoint.includes("/auth/") &&
        !endpoint.includes("/admin/login")
      ) {
        throw new Error("Authentication required. Please login first.");
      }

      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem("adminToken");
          localStorage.removeItem("token");
          localStorage.removeItem("adminUser");
          throw new Error("Session expired. Please login again.");
        }

        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }

        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP Error: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("🚨 Admin API Call Error:", error);
      throw error;
    }
  }

  // Dashboard & Analytics
  async getDashboardStats() {
    return this.apiCall("/admin/dashboard/stats");
  }

  async getAnalytics(period = "7d", type = "overview") {
    return this.apiCall(`/admin/analytics?period=${period}&type=${type}`);
  }

  async getSystemHealth() {
    return this.apiCall("/admin/system/health");
  }

  // User Management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.apiCall(`/admin/users?${queryString}`);
  }

  async getUserById(userId) {
    return this.apiCall(`/admin/users/${userId}`);
  }

  async createUser(userData) {
    return this.apiCall("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.apiCall(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.apiCall(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getUserStats() {
    return this.apiCall("/admin/users/stats");
  }

  // Quiz Management
  async getQuizzes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.apiCall(`/admin/quizzes?${queryString}`);
  }

  async getQuizById(quizId) {
    return this.apiCall(`/admin/quizzes/${quizId}`);
  }

  async createQuiz(quizData) {
    return this.apiCall("/admin/quizzes", {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  }

  async updateQuiz(quizId, quizData) {
    return this.apiCall(`/admin/quizzes/${quizId}`, {
      method: "PUT",
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(quizId) {
    return this.apiCall(`/admin/quizzes/${quizId}`, {
      method: "DELETE",
    });
  }

  async toggleQuizPublication(quizId) {
    return this.apiCall(`/admin/quizzes/${quizId}/toggle-publication`, {
      method: "PATCH",
    });
  }

  async getQuizAttempts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.apiCall(`/admin/quizzes/attempts?${queryString}`);
  }

  async getQuizStats() {
    return this.apiCall("/admin/quizzes/stats");
  }

  // Notification Management
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.apiCall(`/notifications/admin?${queryString}`);
  }

  async getNotificationById(notificationId) {
    return this.apiCall(`/notifications/admin/${notificationId}`);
  }

  async createNotification(notificationData) {
    return this.apiCall("/notifications/admin", {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  }

  async updateNotification(notificationId, notificationData) {
    return this.apiCall(`/notifications/admin/${notificationId}`, {
      method: "PUT",
      body: JSON.stringify(notificationData),
    });
  }

  async deleteNotification(notificationId) {
    return this.apiCall(`/notifications/admin/${notificationId}`, {
      method: "DELETE",
    });
  }

  async getNotificationAnalytics() {
    return this.apiCall("/notifications/admin/analytics");
  }

  // Study Materials (Admin Panel)
  async getMaterials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.apiCall(`/admin/study-materials?${queryString}`);
  }

  async getMaterialById(materialId) {
    return this.apiCall(`/admin/study-materials/${materialId}`);
  }

  async createMaterial(materialData) {
    const token = this.getAuthToken();
    const url = `${this.baseURL}/admin/study-materials`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: materialData, // FormData object
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const details = Array.isArray(errorData.errors)
        ? " - " +
          errorData.errors.map((e) => `${e.field}: ${e.message}`).join(", ")
        : "";
      throw new Error(
        (errorData.message || `HTTP Error: ${response.status}`) + details
      );
    }

    return await response.json();
  }

  async updateMaterial(materialId, materialData) {
    const token = this.getAuthToken();
    const url = `${this.baseURL}/admin/study-materials/${materialId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: materialData, // FormData object
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const details = Array.isArray(errorData.errors)
        ? " - " +
          errorData.errors.map((e) => `${e.field}: ${e.message}`).join(", ")
        : "";
      throw new Error(
        (errorData.message || `HTTP Error: ${response.status}`) + details
      );
    }

    return await response.json();
  }

  async deleteMaterial(materialId) {
    return this.apiCall(`/admin/study-materials/${materialId}`, {
      method: "DELETE",
    });
  }

  async toggleMaterialPublication(materialId) {
    return this.apiCall(
      `/admin/study-materials/${materialId}/toggle-publication`,
      {
        method: "PATCH",
      }
    );
  }

  async bulkPublishMaterials(materialIds) {
    return this.apiCall("/admin/study-materials/bulk-publish", {
      method: "POST",
      body: JSON.stringify({ materialIds }),
    });
  }

  async bulkDeleteMaterials(materialIds) {
    return this.apiCall("/admin/study-materials/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ materialIds }),
    });
  }

  async getMaterialStats() {
    return this.apiCall("/admin/study-materials/stats");
  }

  async downloadMaterial(materialId) {
    return this.apiCall(`/admin/study-materials/${materialId}/download`);
  }

  async previewMaterial(materialId) {
    return this.apiCall(`/admin/study-materials/${materialId}/preview`);
  }
}

// Create singleton instance
const adminAPI = new AdminAPI();

export default adminAPI;

// Named exports for convenience
export const {
  getDashboardStats,
  getAnalytics,
  getSystemHealth,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizPublication,
  getQuizAttempts,
  getQuizStats,
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationAnalytics,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = adminAPI;
