import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";

export const useUserStore = defineStore("user", () => {
  // =====================================================
  // STATE
  // =====================================================

  const users = ref([]);
  const offices = ref([]);
  const employees = ref([]);
  const roles = ref([]);

  // Cache for full employee detail, keyed by ControlNo.
  const employeeDetails = ref({});

  const loading = ref(false);
  const officesLoading = ref(false);
  const employeesLoading = ref(false);
  const rolesLoading = ref(false);
  const employeeDetailLoading = ref(false);

  const error = ref(null);

  // =====================================================
  // INITIALIZE
  // =====================================================

  async function init() {
    await fetchUsers();
  }

  // =====================================================
  // USERS
  // =====================================================

  async function fetchUsers(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get("/users", { params });

      users.value = data.data || [];

      return {
        success: true,
        data: users.value,
      };
    } catch (err) {
      console.error("Fetch users error:", err);

      error.value = err.response?.data?.message || "Unable to load users.";

      return {
        success: false,
        message: error.value,
      };
    } finally {
      loading.value = false;
    }
  }

  async function createUser(userData) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post("/auth/create", userData);

      return {
        success: true,
        message: data.message || "User created successfully.",
        data: data.user,
      };
    } catch (err) {
      console.error("Create user error:", err);

      const responseData = err.response?.data;
      let message = responseData?.message || "Unable to create user.";

      if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0];
        }
      }

      error.value = message;

      return {
        success: false,
        message,
      };
    } finally {
      loading.value = false;
    }
  }

  async function getUser(id) {
    try {
      const { data } = await api.get(`/users/${id}`);

      return {
        success: true,
        data: data.data,
      };
    } catch (err) {
      console.error("Get user error:", err);

      const message = err.response?.data?.message || "Unable to load user.";

      return {
        success: false,
        message,
      };
    }
  }

  async function updateUser(id, payload) {
    try {
      const { data } = await api.put(`/users/${id}`, payload);

      await fetchUsers();

      return {
        success: true,
        message: data.message || "User updated successfully.",
      };
    } catch (err) {
      console.error("Update user error:", err);

      const responseData = err.response?.data;
      let message = responseData?.message || "Unable to update user.";

      if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0];
        }
      }

      return {
        success: false,
        message,
      };
    }
  }

  async function resetPassword(id, payload) {
    try {
      const { data } = await api.post(`/users/${id}/reset-password`, payload);

      return {
        success: true,
        message: data.message || "Password reset successfully.",
      };
    } catch (err) {
      console.error("Reset password error:", err);

      const responseData = err.response?.data;
      let message = responseData?.message || "Unable to reset password.";

      if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0];
        }
      }

      return {
        success: false,
        message,
      };
    }
  }

  async function toggleStatus(id) {
    try {
      const { data } = await api.patch(`/users/${id}/status`);

      await fetchUsers();

      return {
        success: true,
        message: data.message || "User status updated successfully.",
        data,
      };
    } catch (err) {
      console.error("Toggle user status error:", err);

      return {
        success: false,
        message: err.response?.data?.message || "Unable to update user status.",
      };
    }
  }

  async function deleteUser(id) {
    try {
      const { data } = await api.delete(`/users/${id}`);

      await fetchUsers();

      return {
        success: true,
        message: data.message || "User deleted successfully.",
      };
    } catch (err) {
      console.error("Delete user error:", err);

      return {
        success: false,
        message: err.response?.data?.message || "Unable to delete user.",
      };
    }
  }

  // =====================================================
  // OFFICES
  // =====================================================

  async function fetchOffices() {
    officesLoading.value = true;

    try {
      const { data } = await api.get("/offices");

      offices.value = data.data || [];

      return {
        success: true,
        data: offices.value,
      };
    } catch (err) {
      console.error("Fetch offices error:", err);

      const message = err.response?.data?.message || "Unable to load offices.";

      return {
        success: false,
        message,
      };
    } finally {
      officesLoading.value = false;
    }
  }

  // =====================================================
  // EMPLOYEES BY OFFICE
  // =====================================================

  async function fetchEmployeesByOffice(officeName) {
    employeesLoading.value = true;

    try {
      if (!officeName) {
        employees.value = [];
        return { success: true, data: [] };
      }

      const encodedOffice = encodeURIComponent(officeName);

      const { data } = await api.get(`/offices/${encodedOffice}/employees`);

      employees.value = data.data || [];

      return {
        success: true,
        data: employees.value,
      };
    } catch (err) {
      console.error("Fetch employees by office error:", err);

      employees.value = [];

      const message =
        err.response?.data?.message || "Unable to load employees.";

      return {
        success: false,
        message,
      };
    } finally {
      employeesLoading.value = false;
    }
  }

  function clearEmployees() {
    employees.value = [];
  }

  // =====================================================
  // SINGLE EMPLOYEE DETAIL (by ControlNo)
  // -----------------------------------------------------
  // Hits /employees/{controlNo} — the OfficeController@employeeByControlNo
  // endpoint — which returns vwActive + PersonalAddt + Service rows
  // together with computed YearsInService / Age.
  // Results are cached in-memory keyed by ControlNo.
  // =====================================================

  async function fetchEmployeeByControlNo(controlNo) {
    if (!controlNo) {
      return { success: false, message: "Missing ControlNo." };
    }

    // Cache hit
    if (employeeDetails.value[controlNo]) {
      return { success: true, data: employeeDetails.value[controlNo] };
    }

    employeeDetailLoading.value = true;

    try {
      const encoded = encodeURIComponent(controlNo);
      const { data } = await api.get(`/employees/${encoded}`);

      const detail = data?.data || null;
      if (detail) {
        employeeDetails.value[controlNo] = detail;
      }

      return { success: true, data: detail };
    } catch (err) {
      console.error("Fetch employee detail error:", err);

      const message =
        err.response?.data?.message || "Unable to load employee details.";

      return { success: false, message };
    } finally {
      employeeDetailLoading.value = false;
    }
  }

  function clearEmployeeDetails() {
    employeeDetails.value = {};
  }

  // =====================================================
  // ROLES
  // =====================================================

  async function fetchRoles() {
    rolesLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.get("/roles");

      const list = Array.isArray(data) ? data : data?.data ?? [];

      roles.value = list.map((r) => ({
        id: r.id,
        name: r.name,
        user_count: r.user_count ?? 0,
        permissions: (r.permissions ?? []).map((p) => ({
          id: p.id,
          name: p.name,
        })),
      }));

      return {
        success: true,
        data: roles.value,
      };
    } catch (err) {
      console.error("Fetch roles error:", err);

      const message = err.response?.data?.message || "Unable to load roles.";

      error.value = message;

      return {
        success: false,
        message,
      };
    } finally {
      rolesLoading.value = false;
    }
  }

  async function createRole(payload) {
    rolesLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.post("/roles", payload);

      await fetchRoles();

      return {
        success: true,
        message: data.message || "Role created.",
        role: data.role,
      };
    } catch (err) {
      console.error("Create role error:", err);

      const responseData = err.response?.data;
      let message = responseData?.message || "Unable to create role.";

      if (responseData?.errors) {
        const first = Object.values(responseData.errors)[0];
        if (Array.isArray(first) && first.length) message = first[0];
      }

      error.value = message;
      return { success: false, message };
    } finally {
      rolesLoading.value = false;
    }
  }

  async function updateRolePermissions(roleId, permissions) {
    rolesLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.put(`/roles/${roleId}/permissions`, {
        permissions,
      });

      await fetchRoles();

      return {
        success: true,
        message: data.message || "Role permissions updated.",
        permissions: data.permissions,
      };
    } catch (err) {
      console.error("Update role permissions error:", err);

      const responseData = err.response?.data;
      let message = responseData?.message || "Unable to update permissions.";

      if (responseData?.errors) {
        const first = Object.values(responseData.errors)[0];
        if (Array.isArray(first) && first.length) message = first[0];
      }

      error.value = message;
      return { success: false, message };
    } finally {
      rolesLoading.value = false;
    }
  }

  async function deleteRole(roleId) {
    rolesLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.delete(`/roles/${roleId}`);

      await fetchRoles();

      return {
        success: true,
        message: data.message || "Role deleted.",
      };
    } catch (err) {
      console.error("Delete role error:", err);

      const responseData = err.response?.data;
      const message = responseData?.message || "Unable to delete role.";

      error.value = message;
      return { success: false, message };
    } finally {
      rolesLoading.value = false;
    }
  }

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Users
    users,

    // Office / Employee / Role data
    offices,
    employees,
    roles,

    // Employee full detail cache
    employeeDetails,

    // Loading states
    loading,
    officesLoading,
    employeesLoading,
    rolesLoading,
    employeeDetailLoading,

    // Error
    error,

    // Initialization
    init,

    // User management
    fetchUsers,
    createUser,
    getUser,
    updateUser,
    resetPassword,
    toggleStatus,
    deleteUser,

    // Office / Employee
    fetchOffices,
    fetchEmployeesByOffice,
    clearEmployees,

    // Single employee detail
    fetchEmployeeByControlNo,
    clearEmployeeDetails,

    // Roles
    fetchRoles,
    createRole,
    updateRolePermissions,
    deleteRole,
  };
});
