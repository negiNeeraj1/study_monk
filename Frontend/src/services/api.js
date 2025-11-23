// src/services/api.js
import axios from "axios";

// Use environment variable in production, fallback to deployed backend
const baseURL = import.meta.env.VITE_API_URL || "https://study-monk-backend.onrender.com/api";

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
