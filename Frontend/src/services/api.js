// src/services/api.js
import axios from "axios";

// Use environment variable in production, fallback to localhost in development
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("API base URL:", baseURL); // Helpful for debugging

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
