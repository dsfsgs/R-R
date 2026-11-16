// src/stores/loyaltyStore.js
import { defineStore } from "pinia";
import { api } from "boot/axios";

/**
 * Tenure brackets — exclusive ranges so every employee lands in
 * exactly one category. `max = null` means "no upper bound".
 */
const BRACKETS = [
  { id: "all", min: 0, max: null },
  { id: "0_4", min: 0, max: 4 },
  { id: "5_9", min: 5, max: 9 },
  { id: "10_14", min: 10, max: 14 },
  { id: "15_19", min: 15, max: 19 },
  { id: "20_24", min: 20, max: 24 },
  { id: "25_29", min: 25, max: 29 },
  { id: "30_plus", min: 30, max: null },
];

export const useLoyaltyStore = defineStore("loyalty", {
  state: () => ({
    employees: [],
    loading: false,
    loaded: false,
    error: null,
  }),

  getters: {
    total: (state) => state.employees.length,

    maxYears: (state) =>
      state.employees.reduce(
        (max, e) => Math.max(max, Number(e.TotalYearsOfService) || 0),
        0
      ),

    averageYears: (state) => {
      if (state.employees.length === 0) return 0;
      const sum = state.employees.reduce(
        (acc, e) => acc + (Number(e.TotalYearsOfService) || 0),
        0
      );
      return Math.round((sum / state.employees.length) * 10) / 10;
    },

    bracketCounts: (state) => {
      const counts = {};
      for (const b of BRACKETS) counts[b.id] = 0;

      for (const emp of state.employees) {
        const years = Number(emp.TotalYearsOfService) || 0;
        for (const b of BRACKETS) {
          if (b.id === "all") continue;
          const inRange = years >= b.min && (b.max === null || years <= b.max);
          if (inRange) {
            counts[b.id] += 1;
            break;
          }
        }
        counts.all += 1;
      }

      return counts;
    },

    byBracket: (state) => (bracketId) => {
      const bracket = BRACKETS.find((b) => b.id === bracketId);
      if (!bracket || bracketId === "all") return state.employees;

      return state.employees.filter((e) => {
        const years = Number(e.TotalYearsOfService) || 0;
        const aboveMin = years >= bracket.min;
        const belowMax = bracket.max === null || years <= bracket.max;
        return aboveMin && belowMax;
      });
    },

    getByControlNo: (state) => (controlNo) =>
      state.employees.find((e) => String(e.ControlNo) === String(controlNo)) ||
      null,
  },

  actions: {
    async fetch(filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.min_years != null) params.min_years = filters.min_years;
        if (filters.max_years != null) params.max_years = filters.max_years;
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.sort_order) params.sort_order = filters.sort_order;

        const { data } = await api.get("/employees/years-of-service", {
          params,
        });

        this.employees = Array.isArray(data.data) ? data.data : [];
        this.loaded = true;

        return {
          success: true,
          data: this.employees,
          count: this.employees.length,
        };
      } catch (err) {
        const message =
          err?.response?.data?.message || "Unable to load loyalty data.";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch a single employee's tenure (fresh from the server).
     */
    async fetchOne(controlNo) {
      try {
        const { data } = await api.get(
          `/employees/years-of-service/${controlNo}`
        );
        return { success: true, data: data.data };
      } catch (err) {
        return {
          success: false,
          message:
            err?.response?.data?.message || "Unable to load employee tenure.",
        };
      }
    },

    /**
     * Fetch a single employee's service record from xService.
     * Stateless — caller owns the loading/error/data state.
     */
    async fetchServiceRecord(controlNo) {
      try {
        const { data } = await api.get(`/service-records/${controlNo}`);
        return { success: true, data: data.data };
      } catch (err) {
        return {
          success: false,
          message:
            err?.response?.data?.message || "Unable to load service record.",
        };
      }
    },
  },
});
