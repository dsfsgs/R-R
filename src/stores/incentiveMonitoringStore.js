// src/stores/incentiveMonitoringStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";

export const useIncentiveMonitoringStore = defineStore(
  "incentiveMonitoring",
  () => {
    const rows = ref([]);
    const isLoading = ref(false);
    const lastError = ref(null);

    // -----------------------------------------------------------------
    async function fetch(filters = {}) {
      isLoading.value = true;
      lastError.value = null;
      try {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.type) params.type = filters.type;
        if (filters.office) params.office = filters.office;
        if (filters.year) params.year = filters.year;
        if (filters.q) params.q = filters.q;

        const { data } = await api.get("/incentives/monitoring", { params });
        rows.value = Array.isArray(data) ? data : [];
        return { success: true, message: "Incentive payouts loaded." };
      } catch (err) {
        lastError.value =
          err?.response?.data?.message || "Unable to load incentive payouts.";
        return { success: false, message: lastError.value };
      } finally {
        isLoading.value = false;
      }
    }

    // -----------------------------------------------------------------
    async function release(id, remarks = null) {
      try {
        const { data } = await api.patch(
          `/incentives/monitoring/${id}/release`,
          { remarks: remarks || null }
        );
        const idx = rows.value.findIndex((r) => String(r.id) === String(id));
        if (idx >= 0) rows.value[idx] = data.data;
        return { success: true, message: data.message, data: data.data };
      } catch (err) {
        return {
          success: false,
          message:
            err?.response?.data?.message || "Unable to release incentive.",
          errors: err?.response?.data?.errors || null,
        };
      }
    }

    // -----------------------------------------------------------------
    async function cancel(id, remarks) {
      try {
        const { data } = await api.patch(
          `/incentives/monitoring/${id}/cancel`,
          { remarks }
        );
        const idx = rows.value.findIndex((r) => String(r.id) === String(id));
        if (idx >= 0) rows.value[idx] = data.data;
        return { success: true, message: data.message, data: data.data };
      } catch (err) {
        return {
          success: false,
          message:
            err?.response?.data?.message || "Unable to cancel incentive.",
          errors: err?.response?.data?.errors || null,
        };
      }
    }

    // -----------------------------------------------------------------
    return {
      rows,
      isLoading,
      lastError,
      fetch,
      release,
      cancel,
    };
  }
);
