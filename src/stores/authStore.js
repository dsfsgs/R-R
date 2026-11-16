// stores/authStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "boot/axios";

const STORAGE_TOKEN_KEY = "authToken";
const STORAGE_USER_KEY = "authUser";
const STORAGE_PERMISSIONS_KEY = "authPermissions";

export const useAuthStore = defineStore("auth", () => {
  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  const token = ref(localStorage.getItem(STORAGE_TOKEN_KEY) || null);
  const user = ref(readStoredUser());
  const permissions = ref(readStoredPermissions());
  const isLoading = ref(false);
  const error = ref(null);
  const isInitialized = ref(false);

  // ---------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------
  const isAuthenticated = computed(() => {
    return !!token.value;
  });

  const fullName = computed(() => user.value?.name || "");
  const email = computed(() => user.value?.email || "");
  const office = computed(() => user.value?.office || "No Office Assigned");
  const roles = computed(() => user.value?.roles || []);

  const hasRole = (role) => {
    if (!role) return false;
    if (!Array.isArray(roles.value)) return false;
    return roles.value.includes(role);
  };

  const hasPermission = (permission) => {
    if (!permission) return true; // no requirement = allow
    if (!Array.isArray(permissions.value)) return false; // defensive
    return permissions.value.includes(permission);
  };

  const hasAnyPermission = (list = []) => {
    if (!Array.isArray(list) || list.length === 0) return true;
    return list.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (list = []) => {
    if (!Array.isArray(list) || list.length === 0) return true;
    return list.every((p) => hasPermission(p));
  };

  // ---------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------
  async function login(credentials) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.post("/auth/login", credentials);

      if (!data.token) {
        console.error("❌ No token in response!");
        error.value = data.message || "Invalid username or password.";
        return { success: false, message: error.value };
      }

      const authToken = data.token;
      token.value = authToken;
      localStorage.setItem(STORAGE_TOKEN_KEY, authToken);

      const userData = data.user;
      if (!userData) {
        console.error("❌ No user data in response!");
        error.value = "Invalid server response. Missing user data.";
        return { success: false, message: error.value };
      }

      user.value = userData;
      permissions.value = Array.isArray(userData.permissions)
        ? userData.permissions
        : [];
      isInitialized.value = true;

      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(
        STORAGE_PERMISSIONS_KEY,
        JSON.stringify(permissions.value)
      );

      return { success: true, message: data.message || "Login successful" };
    } catch (err) {
      console.error("❌ Login error:", err);
      error.value =
        err.response?.data?.message ||
        "Unable to reach the server. Please try again.";
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Refresh the current user from the server.
   * Use after role/permission changes to see them without re-login.
   */
  async function fetchMe() {
    if (!token.value) {
      return { success: false, message: "Not authenticated." };
    }

    try {
      const { data } = await api.get("/auth/me");

      if (!data.user) {
        return { success: false, message: "No user in response." };
      }

      user.value = data.user;
      permissions.value = Array.isArray(data.user.permissions)
        ? data.user.permissions
        : [];

      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user.value));
      localStorage.setItem(
        STORAGE_PERMISSIONS_KEY,
        JSON.stringify(permissions.value)
      );

      return { success: true };
    } catch (err) {
      console.error("fetchMe error:", err);

      if (err.response?.status === 401) {
        await logout();
      }

      return {
        success: false,
        message: err.response?.data?.message || "Unable to refresh user.",
      };
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch {
      // Ignore logout errors — proceed with clearing local state
    } finally {
      token.value = null;
      user.value = null;
      permissions.value = []; // ← FIXED: was null, caused .includes() crash
      isInitialized.value = false;

      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_PERMISSIONS_KEY);
    }
  }

  function clearError() {
    error.value = null;
  }

  function hasStoredUserData() {
    return !!localStorage.getItem(STORAGE_USER_KEY);
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  function readStoredUser() {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function readStoredPermissions() {
    try {
      const raw = localStorage.getItem(STORAGE_PERMISSIONS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // Defensive: old buggy versions stored `null` here
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function initialize() {
    if (hasStoredUserData()) {
      user.value = readStoredUser();
      permissions.value = readStoredPermissions();
      isInitialized.value = true;
    }
  }

  // Initialize on store creation
  initialize();

  // ---------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------
  return {
    // state
    token,
    user,
    permissions,
    isLoading,
    error,
    isInitialized,

    // getters
    isAuthenticated,
    fullName,
    email,
    office,
    roles,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasStoredUserData,

    // actions
    login,
    fetchMe,
    logout,
    clearError,
    initialize,
  };
});
