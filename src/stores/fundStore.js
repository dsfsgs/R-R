// src/stores/fundStore.js

import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";

export const useFundStore = defineStore("fund", () => {
  const rows = ref([]);
  const summaries = ref({}); // fund_id → { allocated, actual_expenses, adjustments, available }
  const transactions = ref([]);

  const isLoading = ref(false);
  const isSaving = ref(false);
  const isLoadingTransactions = ref(false);

  /**
   * GET /api/funds
   *
   * The backend now embeds a `summary` object on each row, so this is
   * a single request. The per-fund fallback is kept only for safety
   * if a future change stops embedding it.
   */
  async function fetch() {
    isLoading.value = true;
    try {
      const res = await api.get("/funds");
      rows.value = res.data?.data ?? [];

      const results = await Promise.all(
        rows.value.map(async (fund) => {
          if (fund.summary) {
            return { id: fund.id, data: fund.summary };
          }
          try {
            const r = await api.get(`/funds/${fund.id}/summary`);
            return { id: fund.id, data: r.data?.data ?? null };
          } catch {
            return { id: fund.id, data: null };
          }
        })
      );

      const map = {};
      results.forEach(({ id, data }) => {
        map[id] = data;
      });
      summaries.value = map;

      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || "Failed to load funds.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload) {
    isSaving.value = true;
    try {
      const res = await api.post("/funds", payload);
      await fetch();
      return { success: true, message: res.data?.message || "Fund created." };
    } catch (e) {
      return {
        success: false,
        message: extractError(e, "Failed to create fund."),
      };
    } finally {
      isSaving.value = false;
    }
  }

  async function update(id, payload) {
    isSaving.value = true;
    try {
      const res = await api.put(`/funds/${id}`, payload);
      await fetch();
      return { success: true, message: res.data?.message || "Fund updated." };
    } catch (e) {
      return {
        success: false,
        message: extractError(e, "Failed to update fund."),
      };
    } finally {
      isSaving.value = false;
    }
  }

  async function destroy(id) {
    isSaving.value = true;
    try {
      const res = await api.delete(`/funds/${id}`);
      await fetch();
      return { success: true, message: res.data?.message || "Fund deleted." };
    } catch (e) {
      return {
        success: false,
        message: extractError(e, "Failed to delete fund."),
      };
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * GET /api/funds/{fundId}/transactions
   * Keyed by fund ID (not fiscal year) — multiple funds may share a year.
   */
  async function fetchTransactions(fundId, limit = 50) {
    isLoadingTransactions.value = true;
    transactions.value = [];
    try {
      const r = await api.get(`/funds/${fundId}/transactions`, {
        params: { limit },
      });
      transactions.value = r.data?.data ?? [];
      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || "Failed to load transactions.",
      };
    } finally {
      isLoadingTransactions.value = false;
    }
  }

  function extractError(e, fallback) {
    const errors = e.response?.data?.errors;
    if (errors) {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && first.length) return first[0];
    }
    return e.response?.data?.message || fallback;
  }

  return {
    rows,
    summaries,
    transactions,
    isLoading,
    isSaving,
    isLoadingTransactions,
    fetch,
    create,
    update,
    destroy,
    fetchTransactions,
  };
});
