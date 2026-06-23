import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor: handle 401 (session expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local storage
      // Don't redirect here to avoid import cycles; AuthContext handles the UI
      const message = error.response?.data?.message || "";
      if (message.includes("expired") || message.includes("Invalid") || message.includes("no longer exists")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Trigger page reload if we're not already on auth pages
        const path = window.location.pathname;
        if (path !== "/login" && path !== "/signup") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;