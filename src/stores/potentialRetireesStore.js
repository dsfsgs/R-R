// src/stores/potentialRetireesStore.js
import { defineStore } from "pinia";
import { api } from "boot/axios";

export const usePotentialRetireesStore = defineStore("potentialRetirees", {
  state: () => ({
    employees: [],
    loading: false,
    loaded: false,
    error: null,
  }),

  getters: {
    total: (state) => state.employees.length,

    /**
     * Highest Age in the dataset.
     */
    maxAge: (state) =>
      state.employees.reduce((max, e) => Math.max(max, Number(e.Age) || 0), 0),

    /**
     * Average Age, rounded to 1 decimal.
     */
    averageAge: (state) => {
      if (state.employees.length === 0) return 0;
      const sum = state.employees.reduce(
        (acc, e) => acc + (Number(e.Age) || 0),
        0
      );
      return Math.round((sum / state.employees.length) * 10) / 10;
    },

    /**
     * Employees aged 60+ — the usual compulsory-retirement threshold.
     */
    retirementAgeReached: (state) =>
      state.employees.filter((e) => (Number(e.Age) || 0) >= 60).length,

    getByControlNo: (state) => (controlNo) =>
      state.employees.find((e) => String(e.ControlNo) === String(controlNo)) ||
      null,
  },

  actions: {
    /**
     * Load the full potential-retirees roster.
     * The backend has no query-param filters — everything is
     * filtered client-side on the page.
     */
    async fetch() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.get("/employees/potential-retirees");

        this.employees = Array.isArray(data.data) ? data.data : [];
        this.loaded = true;

        return {
          success: true,
          data: this.employees,
          count: this.employees.length,
        };
      } catch (err) {
        const message =
          err?.response?.data?.message || "Unable to load potential retirees.";
        this.error = message;
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch a single employee's service record from xService.
     * Stateless — caller owns loading/error/data.
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
