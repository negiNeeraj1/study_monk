// Admin Panel API Service
const API_BASE_URL = "http://localhost:5000/api";

class AdminAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    // Try both possible token keys for compatibility
    return localStorage.getItem("token") || localStorage.getItem("adminToken");
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
      if (!token && !endpoint.includes('/health') && !endpoint.includes('/auth/')) {
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
          localStorage.removeItem("token");
          localStorage.removeItem("adminToken");
          throw new Error("Session expired. Please login again.");
        }
        
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP Error: ${response.status}`);
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

  // Study Materials (using existing backend)
  async getMaterials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.apiCall(`/study-materials?${queryString}`);
  }

  async createMaterial(materialData) {
    return this.apiCall("/study-materials", {
      method: "POST",
      body: JSON.stringify(materialData),
    });
  }

  async updateMaterial(materialId, materialData) {
    return this.apiCall(`/study-materials/${materialId}`, {
      method: "PUT",
      body: JSON.stringify(materialData),
    });
  }

  async deleteMaterial(materialId) {
    return this.apiCall(`/study-materials/${materialId}`, {
      method: "DELETE",
    });
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
