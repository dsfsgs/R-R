// src/stores/localAwardStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";

/**
 * Store for the LOCAL AWARDS listing page.
 *
 * "Local" = every nomination type NOT in the national award family
 * (gawad_lingkod_bayan, gawad_dangal_ng_bayan, gawad_pagasa).
 * The backend exposes this as GET /nominations/local.
 *
 * Read-only for the list; mutations live on the main nominationStore.
 */
export const useLocalAwardStore = defineStore("localAward", () => {
  const rows = ref([]);
  const isLoading = ref(false);
  const lastError = ref(null);

  function getById(id) {
    return rows.value.find((n) => String(n.id) === String(id)) || null;
  }

  // -------------------------------------------------------------------
  async function fetchLocal(filters = {}) {
    isLoading.value = true;
    lastError.value = null;
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;

      const { data } = await api.get("/nominations/local", { params });
      rows.value = Array.isArray(data) ? data : [];
      return { success: true, message: "Local awards loaded." };
    } catch (err) {
      lastError.value =
        err?.response?.data?.message || "Unable to load local awards.";
      return { success: false, message: lastError.value };
    } finally {
      isLoading.value = false;
    }
  }

  // -------------------------------------------------------------------
  async function fetchLocalForHr(filters = {}) {
    isLoading.value = true;
    lastError.value = null;
    try {
      const params = {};
      if (filters.office) params.office = filters.office;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.includeDrafts) params.include_drafts = 1;

      const { data } = await api.get("/hr/nominations/local", { params });
      rows.value = Array.isArray(data) ? data : [];
      return { success: true, message: "Local awards loaded." };
    } catch (err) {
      lastError.value =
        err?.response?.data?.message || "Unable to load local awards.";
      return { success: false, message: lastError.value };
    } finally {
      isLoading.value = false;
    }
  }

  // -------------------------------------------------------------------
  async function fetchOne(id, { cache = true } = {}) {
    if (cache) {
      const existing = rows.value.find((n) => String(n.id) === String(id));
      if (existing && Array.isArray(existing.status_history)) {
        return { success: true, data: existing };
      }
    }

    try {
      const { data } = await api.get(`/nominations/${id}`);
      const idx = rows.value.findIndex((n) => String(n.id) === String(id));
      if (idx >= 0) rows.value[idx] = data;
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to load nomination.",
      };
    }
  }

  function clear() {
    rows.value = [];
    lastError.value = null;
  }

  return {
    rows,
    isLoading,
    lastError,
    getById,
    fetchLocal,
    fetchLocalForHr,
    fetchOne,
    clear,
  };
});
