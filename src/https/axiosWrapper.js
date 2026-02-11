import axios from "axios";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: "http://localhost:8000", // Fallback to hardcoded if env missing
  withCredentials: true,
  headers: { ...defaultHeader },
});

// ✅ ADDED: Request Interceptor to attach Token
axiosWrapper.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ ADDED: Response Interceptor to handle 401 (Token Expired)
axiosWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // ✅ Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ✅ Prevent infinite reload loop
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);