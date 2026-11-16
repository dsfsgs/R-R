import { boot } from "quasar/wrappers";
import axios from "axios";
import { Notify } from "quasar";
import { useAuthStore } from "stores/authStore";

const api = axios.create({
  baseURL: "http://192.168.8.80:8000/api",
  // baseURL: "http://127.0.0.1:8000/api",
  timeout: 30000,
  // Do NOT set a default Content-Type here.
  // Axios will pick the right one per request:
  //   - plain object  → application/json
  //   - FormData      → multipart/form-data with boundary
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔐 401 Unauthorized - Logging out...");

      const authStore = useAuthStore();
      authStore.logout();

      const router = globalThis.$router;
      if (router) {
        router.push({
          name: "login",
          query: {
            session: "expired",
            message: "Your session has expired. Please log in again.",
          },
        });
      }

      Notify.create({
        message: "Session expired. Please login again.",
        type: "negative",
      });
    }

    return Promise.reject(error);
  }
);

export default boot(({ app, router }) => {
  globalThis.$router = router;

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
