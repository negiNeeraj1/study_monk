// API Configuration for Student Panel
export const API_CONFIG = {
  // Admin Backend API URL - where study materials and quizzes are managed
  ADMIN_API_URL:
    import.meta.env.VITE_ADMIN_API_URL || "https://study-monk-backend.onrender.com/api",

  // Main Backend API URL - for AI features and other services
  MAIN_API_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://study-monk-backend.onrender.com/api",

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || "AI Study Platform",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
};

// Helper function to get the correct API URL based on the service
export const getApiUrl = (service = "admin") => {
  switch (service) {
    case "admin":
      return API_CONFIG.ADMIN_API_URL;
    case "main":
      return API_CONFIG.MAIN_API_URL;
    default:
      return API_CONFIG.ADMIN_API_URL;
  }
};

export default API_CONFIG;
