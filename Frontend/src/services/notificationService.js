const NOTIFICATION_API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://aistudy-xfxe.onrender.com/api";

class NotificationService {
  // Get user notifications with improved error handling
  async getUserNotifications(params = {}) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const queryString = new URLSearchParams(params).toString();

      const response = await fetch(
        `${NOTIFICATION_API_BASE}/notifications/user?${queryString}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Server responded with ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("🚨 Notification service error:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${NOTIFICATION_API_BASE}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark notification as read");
      }

      return data;
    } catch (error) {
      console.error("🚨 Mark as read error:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${NOTIFICATION_API_BASE}/notifications/mark-all-read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to mark all notifications as read"
        );
      }

      return data;
    } catch (error) {
      console.error("🚨 Mark all as read error:", error);
      throw error;
    }
  }

  // Get unread notification count (optimized endpoint)
  async getUnreadCount() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return 0;
      }

      const response = await fetch(
        `${NOTIFICATION_API_BASE}/notifications/unread-count`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.success ? data.data.count : 0;
    } catch (error) {
      console.error("🚨 Unread count error:", error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
