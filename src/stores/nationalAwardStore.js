// src/stores/nationalAwardStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";

/**
 * Store for the NATIONAL AWARDS listing page.
 *
 * National award types are fixed server-side (gawad_lingkod_bayan,
 * gawad_dangal_ng_bayan, gawad_pagasa) and exposed via the dedicated
 * `/nominations/national` endpoint. This store is READ-ONLY for the list;
 * mutations (submit, withdraw, print, upload) all live on the main
 * nominationStore and operate on the same nomination ids.
 */
export const useNationalAwardStore = defineStore("nationalAward", () => {
  // List rows are COMPACT — same shape as the main nomination list
  // (id, reference_no, type, office, status, employee, is_office,
  // details, submitted_at, last_status_changed_at, ...).
  const rows = ref([]);
  const isLoading = ref(false);
  const lastError = ref(null);

  // -------------------------------------------------------------------
  function getById(id) {
    return rows.value.find((n) => String(n.id) === String(id)) || null;
  }

  // -------------------------------------------------------------------
  // Fetch the office's NATIONAL award nominations.
  // Filters are passed through as query params so the server can scope
  // (type / status). Office scoping is implicit — the backend uses the
  // authenticated user's office.
  // -------------------------------------------------------------------
  async function fetchNational(filters = {}) {
    isLoading.value = true;
    lastError.value = null;
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;

      const { data } = await api.get("/nominations/national", { params });
      rows.value = Array.isArray(data) ? data : [];
      return { success: true, message: "National awards loaded." };
    } catch (err) {
      lastError.value =
        err?.response?.data?.message || "Unable to load national awards.";
      return { success: false, message: lastError.value };
    } finally {
      isLoading.value = false;
    }
  }

  // -------------------------------------------------------------------
  // HR variant — unrestricted by office.
  // -------------------------------------------------------------------
  async function fetchNationalForHr(filters = {}) {
    isLoading.value = true;
    lastError.value = null;
    try {
      const params = {};
      if (filters.office) params.office = filters.office;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.includeDrafts) params.include_drafts = 1;

      const { data } = await api.get("/hr/nominations/national", { params });
      rows.value = Array.isArray(data) ? data : [];
      return { success: true, message: "National awards loaded." };
    } catch (err) {
      lastError.value =
        err?.response?.data?.message || "Unable to load national awards.";
      return { success: false, message: lastError.value };
    } finally {
      isLoading.value = false;
    }
  }

  // -------------------------------------------------------------------
  // Fetch the FULL record for one national nomination.
  // Uses the shared `/nominations/{id}` endpoint — national rows still
  // resolve through the same controller + strategy.
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

  // -------------------------------------------------------------------
  function clear() {
    rows.value = [];
    lastError.value = null;
  }

  return {
    rows,
    isLoading,
    lastError,
    getById,
    fetchNational,
    fetchNationalForHr,
    fetchOne,
    clear,
  };
});
