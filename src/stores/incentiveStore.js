import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useIncentiveStore = defineStore("incentive", {
  state: () => ({
    incentives: [],
    loading: false,
    saving: false,
  }),

  getters: {
    /**
     * Grouped by category — handy for rendering
     * two sections (Competition based / Citation based)
     * in the page, if you want that layout later.
     */
    groupedByCategory: (state) => {
      return state.incentives.reduce((acc, row) => {
        if (!acc[row.category]) acc[row.category] = [];
        acc[row.category].push(row);
        return acc;
      }, {});
    },
  },

  actions: {
    /**
     * Fetch all incentive rows.
     * GET /api/incentives
     */
    async fetchIncentives() {
      this.loading = true;
      try {
        const { data } = await api.get("/incentives");
        this.incentives = data.data || [];
        return { success: true, data: this.incentives };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            "Unable to load incentives. Please try again.",
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update a single incentive's amounts.
     * PUT /api/incentives/{id}
     *
     * Only `group_amount` and `individual_amount` are sent —
     * the backend ignores any other field anyway.
     */
    async updateIncentive(id, payload) {
      this.saving = true;
      try {
        const { data } = await api.put(`/incentives/${id}`, {
          group_amount: payload.group_amount,
          individual_amount: payload.individual_amount,
        });

        // Update local state with the fresh row from the server
        const idx = this.incentives.findIndex((r) => r.id === id);
        if (idx !== -1 && data.data) {
          this.incentives.splice(idx, 1, data.data);
        }

        return {
          success: true,
          message: data.message || "Incentive amounts updated successfully.",
          data: data.data,
        };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            "Unable to update incentive amounts.",
        };
      } finally {
        this.saving = false;
      }
    },

    /**
     * Bulk update amounts for many rows at once.
     * PUT /api/incentives
     *
     * Expected payload:
     * {
     *   incentives: [
     *     { id, group_amount, individual_amount },
     *     ...
     *   ]
     * }
     */
    async bulkUpdateIncentives(rows) {
      this.saving = true;
      try {
        const { data } = await api.put("/incentives", {
          incentives: rows,
        });

        if (data.data) {
          this.incentives = data.data;
        }

        return {
          success: true,
          message: data.message || "Incentive amounts updated successfully.",
        };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            "Unable to update incentive amounts.",
        };
      } finally {
        this.saving = false;
      }
    },

    /**
     * Reset the store (used on logout or page unmount if desired).
     */
    clear() {
      this.incentives = [];
      this.loading = false;
      this.saving = false;
    },
  },
});
