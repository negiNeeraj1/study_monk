const NOTIFICATION_API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://aistudy-xfxe.onrender.com/api";

// Simple in-memory cache to reduce rate-limit hits
const cacheStore = new Map();
const setCache = (key, value, ttlMs) => {
  cacheStore.set(key, { value, expires: Date.now() + ttlMs });
};
const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

class NotificationService {
  // Get user notifications with improved error handling
  async getUserNotifications(params = {}) {
    try {
      const cacheKey = `notifications:${JSON.stringify(params)}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

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
        if (response.status === 429) {
          // Back off for 60s on rate limit
          setCache(
            cacheKey,
            { success: true, data: { notifications: [] } },
            60000
          );
          throw new Error("Too many requests. Limit: 50 per 15 minutes.");
        }
        throw new Error(
          data.error || `Server responded with ${response.status}`
        );
      }

      // Cache for 30s
      setCache(cacheKey, data, 30000);
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
      const cacheKey = "notifications:unread-count";
      const cached = getCache(cacheKey);
      if (cached !== null && cached !== undefined) return cached;

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
        if (response.status === 429) {
          // Cache last known value (default 0) for 60s
          setCache(cacheKey, 0, 60000);
          return 0;
        }
        return 0;
      }

      const data = await response.json();
      const value = data.success ? data.data.count : 0;
      setCache(cacheKey, value, 15000);
      return value;
    } catch (error) {
      console.error("🚨 Unread count error:", error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
