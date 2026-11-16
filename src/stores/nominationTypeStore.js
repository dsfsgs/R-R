import { defineStore } from "pinia";
import { api } from "boot/axios";

// ─────────────────────────────────────────────────────────────
// Display order for the category groups.
// Lower number = higher on the page.
//
// Matches NominationTypesPage + RolePage ordering:
//   1. National Awards
//   2. Local PRAISE Awards
//   3. Customized Rewards and Incentives
// ─────────────────────────────────────────────────────────────
const GROUP_ORDER = {
  national_awards: 1,
  local_praise_awards: 2,
  customized_rewards: 3,
};

function groupRank(key) {
  return GROUP_ORDER[key] ?? 99;
}

export const useNominationTypeStore = defineStore("nominationType", {
  state: () => ({
    all: [],
    active: [],
    loading: false,
    error: null,
  }),

  getters: {
    activeCodes: (state) => new Set(state.active.map((t) => t.code)),

    /**
     * Active types grouped by category, in the order:
     *   National Awards → Local PRAISE Awards → Customized Rewards.
     */
    activeGrouped: (state) => {
      const groups = {};

      for (const t of state.active) {
        if (!groups[t.group]) {
          groups[t.group] = {
            key: t.group,
            label: t.group_label,
            items: [],
          };
        }
        groups[t.group].items.push(t);
      }

      return Object.values(groups).sort(
        (a, b) => groupRank(a.key) - groupRank(b.key)
      );
    },

    /**
     * All types grouped by category, in the order:
     *   National Awards → Local PRAISE Awards → Customized Rewards.
     */
    allGrouped: (state) => {
      const groups = {};

      for (const t of state.all) {
        if (!groups[t.group]) {
          groups[t.group] = {
            key: t.group,
            label: t.group_label,
            items: [],
          };
        }
        groups[t.group].items.push(t);
      }

      return Object.values(groups).sort(
        (a, b) => groupRank(a.key) - groupRank(b.key)
      );
    },
  },

  actions: {
    async fetchActive() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.get("/nomination-types/active");
        this.active = data;
      } catch (err) {
        this.error =
          err?.response?.data?.message || "Failed to load nomination types.";
        console.error("fetchActive failed:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchAll() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.get("/nomination-types");
        this.all = data;
      } catch (err) {
        this.error =
          err?.response?.data?.message || "Failed to load nomination types.";
        console.error("fetchAll failed:", err);
      } finally {
        this.loading = false;
      }
    },

    async setActive(id, isActive) {
      try {
        const { data } = await api.patch(`/nomination-types/${id}/toggle`, {
          is_active: isActive,
        });

        const idx = this.all.findIndex((t) => t.id === id);
        if (idx !== -1) {
          this.all[idx].is_active = isActive;
        }

        const activeIdx = this.active.findIndex((t) => t.id === id);

        if (isActive && activeIdx === -1 && idx !== -1) {
          this.active.push({ ...this.all[idx] });
        } else if (!isActive && activeIdx !== -1) {
          this.active.splice(activeIdx, 1);
        }

        return {
          success: true,
          message: data.message || "Nomination type updated.",
        };
      } catch (err) {
        return {
          success: false,
          message:
            err?.response?.data?.message || "Failed to update nomination type.",
        };
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
