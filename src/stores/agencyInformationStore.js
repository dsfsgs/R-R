import { defineStore } from "pinia";
import { api } from "boot/axios";

const EMPTY_STATE = {
  agencyHead: null,
  regionalOfficeHead: null,
  praiseChairperson: null,
  highestHrmo: null,
};

const ROLE_KEYS = [
  "agencyHead",
  "regionalOfficeHead",
  "praiseChairperson",
  "highestHrmo",
];

export const useAgencyInformationStore = defineStore("agencyInformation", {
  state: () => ({
    officials: { ...EMPTY_STATE },
    loading: false,
    saving: false,
    loaded: false,
  }),

  getters: {
    hasAnyData: (state) =>
      Object.values(state.officials).some((o) => !!o && !!o.firstName),
  },

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const { data } = await api.get("/agency-information");
        this.officials = { ...EMPTY_STATE, ...(data.data || {}) };
        this.loaded = true;
        return { success: true, data: this.officials };
      } catch (err) {
        return {
          success: false,
          message:
            err?.response?.data?.message ||
            "Unable to load agency information.",
        };
      } finally {
        this.loading = false;
      }
    },

    async updateOfficial(roleKey, payload) {
      this.saving = true;
      try {
        // Build a payload that only contains:
        //   1. The role being edited (full data)
        //   2. Any other roles that already have saved data
        // Empty roles are omitted so Laravel's `required` rules
        // never see blank strings.
        const body = {};

        ROLE_KEYS.forEach((key) => {
          if (key === roleKey) {
            body[key] = payload;
          } else if (hasRealData(this.officials[key])) {
            body[key] = normalise(this.officials[key]);
          }
        });

        const { data } = await api.put("/agency-information", body);
        this.officials = { ...EMPTY_STATE, ...(data.data || {}) };
        this.loaded = true;

        return {
          success: true,
          data: this.officials,
          message: data.message,
        };
      } catch (err) {
        const errors = err?.response?.data?.errors;
        const firstError = errors ? Object.values(errors).flat()[0] : null;

        return {
          success: false,
          message:
            firstError ||
            err?.response?.data?.message ||
            "Unable to save agency information.",
        };
      } finally {
        this.saving = false;
      }
    },
  },
});

/**
 * A stored official is considered "real" if it has at least a first
 * or last name. Empty placeholders are treated as missing.
 */
function hasRealData(official) {
  if (!official) return false;
  return !!(official.firstName?.trim() || official.lastName?.trim());
}

function normalise(official) {
  return {
    firstName: official?.firstName || "",
    middleName: official?.middleName || "",
    lastName: official?.lastName || "",
    extensionName: official?.extensionName || "",
    positionTitle: official?.positionTitle || "",
    landline: official?.landline || "",
    mobile: official?.mobile || "",
    email: official?.email || "",
  };
}
