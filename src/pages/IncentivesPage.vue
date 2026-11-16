<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h6>Incentives Library</h6>
        <p>
          Manage the reward amounts for each category and level of recognition.
        </p>
      </div>

      <div class="header-actions">
        <q-btn
          flat
          no-caps
          icon="restart_alt"
          label="Reset Changes"
          class="clear-btn"
          :disable="!isDirty || store.saving"
          @click="confirmReset"
        />

        <q-btn
          unelevated
          no-caps
          icon="save"
          label="Save Changes"
          class="add-user-btn"
          :loading="store.saving"
          :disable="!isDirty"
          @click="saveAll"
        />
      </div>
    </section>

    <!-- =====================================================
         INFO BANNER
    ====================================================== -->
    <!-- <div class="create-info-box">
      <q-icon name="info" size="18px" />
      <span>
        Only the <strong>Group</strong> and <strong>Individual</strong> amounts
        can be edited. Category and level of recognition are locked.
      </span>
    </div> -->

    <!-- =====================================================
         CARD
    ====================================================== -->
    <q-card flat class="users-card">
      <!-- FILTERS -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by category, level..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="categoryFilter"
          outlined
          dense
          emit-value
          map-options
          clearable
          :options="categoryOptions"
          label="Category"
          class="status-filter"
        />

        <q-btn
          flat
          no-caps
          icon="filter_alt_off"
          label="Clear"
          class="clear-btn"
          @click="clearFilters"
        />
      </div>

      <!-- TABLE -->
      <div class="table-wrapper">
        <q-table
          flat
          dense
          :rows="filteredIncentives"
          :columns="columns"
          row-key="id"
          :rows-per-page-options="[10, 20, 50]"
          :pagination="{ rowsPerPage: 10 }"
          class="users-table"
          :loading="store.loading"
        >
          <template #body-cell-no="props">
            <q-td :props="props">{{ props.rowIndex + 1 }}</q-td>
          </template>

          <template #body-cell-category="props">
            <q-td :props="props">
              <span
                class="role-badge"
                :class="categoryClass(props.row.category)"
              >
                {{ props.row.category }}
              </span>
            </q-td>
          </template>

          <template #body-cell-level="props">
            <q-td :props="props">
              <div class="user-name">{{ props.row.level }}</div>
            </q-td>
          </template>

          <template #body-cell-group_amount="props">
            <q-td :props="props">
              <q-input
                :model-value="props.row.group_amount"
                outlined
                dense
                type="number"
                prefix="₱"
                class="amount-input"
                :disable="store.saving"
                :rules="[
                  (val) => (val !== null && val !== '') || 'Amount is required',
                  (val) => Number(val) >= 0 || 'Must be 0 or greater',
                ]"
                @update:model-value="
                  (val) => updateAmount(props.row.id, 'group_amount', val)
                "
              />
            </q-td>
          </template>

          <template #body-cell-individual_amount="props">
            <q-td :props="props">
              <q-input
                :model-value="props.row.individual_amount"
                outlined
                dense
                type="number"
                prefix="₱"
                class="amount-input"
                :disable="store.saving"
                :rules="[
                  (val) => (val !== null && val !== '') || 'Amount is required',
                  (val) => Number(val) >= 0 || 'Must be 0 or greater',
                ]"
                @update:model-value="
                  (val) => updateAmount(props.row.id, 'individual_amount', val)
                "
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="actions-cell">
              <q-btn
                flat
                round
                dense
                icon="undo"
                color="grey-7"
                size="sm"
                :disable="!isRowDirty(props.row.id) || store.saving"
                @click="revertRow(props.row)"
              >
                <q-tooltip>Revert this row</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="payments" size="34px" />
              <div>No incentives found.</div>
            </div>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- =====================================================
         RESET CONFIRMATION
    ====================================================== -->
    <q-dialog v-model="resetDialog">
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon status-confirm-icon">
          <q-icon name="restart_alt" size="25px" />
        </div>

        <div class="confirmation-title">Discard changes?</div>

        <div class="confirmation-message">
          Your unsaved edits will be reverted back to the last saved values.
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            @click="resetDialog = false"
          />

          <q-btn
            unelevated
            no-caps
            label="Discard"
            class="danger-btn"
            @click="resetAll"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref, reactive, onMounted } from "vue";
import { Notify } from "quasar";
import { useIncentiveStore } from "src/stores/incentiveStore";

export default defineComponent({
  name: "IncentivesLibraryPage",

  setup() {
    const store = useIncentiveStore();

    // ---------- FILTERS ----------
    const search = ref("");
    const categoryFilter = ref(null);

    // ---------- DRAFT ----------
    const draft = reactive({});
    const original = reactive({});

    // ---------- DIALOGS ----------
    const resetDialog = ref(false);

    // ---------- TABLE COLUMNS ----------
    const columns = [
      { name: "no", label: "NO.", field: "id", align: "left" },
      {
        name: "category",
        label: "CATEGORY",
        field: "category",
        align: "left",
        sortable: true,
      },
      {
        name: "level",
        label: "LEVEL OF RECOGNITION",
        field: "level",
        align: "left",
        sortable: true,
      },
      {
        name: "group_amount",
        label: "GROUP",
        field: "group_amount",
        align: "left",
      },
      {
        name: "individual_amount",
        label: "INDIVIDUAL",
        field: "individual_amount",
        align: "left",
      },
      { name: "actions", label: "", field: "actions", align: "right" },
    ];

    // ---------- OPTIONS ----------
    const categoryOptions = computed(() => {
      const set = new Set(store.incentives.map((r) => r.category));
      return Array.from(set).map((c) => ({ label: c, value: c }));
    });

    // ---------- DRAFT HELPERS ----------
    function ensureDraft(row) {
      if (!draft[row.id]) {
        draft[row.id] = {
          group_amount: Number(row.group_amount ?? 0),
          individual_amount: Number(row.individual_amount ?? 0),
        };
      }
      if (!original[row.id]) {
        original[row.id] = {
          group_amount: Number(row.group_amount ?? 0),
          individual_amount: Number(row.individual_amount ?? 0),
        };
      }
    }

    function updateAmount(id, field, value) {
      if (!draft[id]) return;
      draft[id][field] = value;
    }

    function markDirty() {
      // no-op — kept for template compatibility
    }

    // ---------- DISPLAY ROWS ----------
    const displayRows = computed(() => {
      return store.incentives.map((row) => {
        ensureDraft(row);
        return {
          ...row,
          group_amount: draft[row.id].group_amount,
          individual_amount: draft[row.id].individual_amount,
        };
      });
    });

    // ---------- FILTERED ROWS ----------
    const filteredIncentives = computed(() => {
      let result = displayRows.value;
      const keyword = search.value.toLowerCase().trim();

      if (keyword) {
        result = result.filter(
          (r) =>
            r.category?.toLowerCase().includes(keyword) ||
            r.level?.toLowerCase().includes(keyword)
        );
      }

      if (categoryFilter.value) {
        result = result.filter((r) => r.category === categoryFilter.value);
      }

      return result;
    });

    // ---------- DIRTY TRACKING ----------
    const isDirty = computed(() => {
      return Object.keys(draft).some((id) => isRowDirty(Number(id)));
    });

    function isRowDirty(id) {
      const d = draft[id];
      const o = original[id];
      if (!d || !o) return false;
      return (
        Number(d.group_amount) !== Number(o.group_amount) ||
        Number(d.individual_amount) !== Number(o.individual_amount)
      );
    }

    // ---------- SEED DRAFT FROM STORE ----------
    function syncDraftFromStore() {
      Object.keys(draft).forEach((k) => delete draft[k]);
      Object.keys(original).forEach((k) => delete original[k]);

      for (const row of store.incentives) {
        draft[row.id] = {
          group_amount: Number(row.group_amount ?? 0),
          individual_amount: Number(row.individual_amount ?? 0),
        };
        original[row.id] = {
          group_amount: Number(row.group_amount ?? 0),
          individual_amount: Number(row.individual_amount ?? 0),
        };
      }
    }

    // ---------- SAVE ----------
    async function saveAll() {
      const rows = [];
      for (const row of store.incentives) {
        if (isRowDirty(row.id)) {
          rows.push({
            id: row.id,
            group_amount: Number(draft[row.id].group_amount),
            individual_amount: Number(draft[row.id].individual_amount),
          });
        }
      }

      if (!rows.length) {
        Notify.create({ type: "info", message: "No changes to save." });
        return;
      }

      const invalid = rows.find(
        (r) =>
          isNaN(r.group_amount) ||
          isNaN(r.individual_amount) ||
          r.group_amount < 0 ||
          r.individual_amount < 0
      );
      if (invalid) {
        Notify.create({
          type: "negative",
          message: "Please enter valid non-negative amounts for all rows.",
        });
        return;
      }

      const result = await store.bulkUpdateIncentives(rows);

      if (!result.success) {
        Notify.create({
          type: "negative",
          message: result.message || "Unable to save changes.",
        });
        return;
      }

      Notify.create({
        type: "positive",
        message: result.message || "Incentive amounts updated successfully.",
      });

      syncDraftFromStore();
    }

    // ---------- REVERT ----------
    function revertRow(row) {
      if (!original[row.id]) return;
      draft[row.id].group_amount = original[row.id].group_amount;
      draft[row.id].individual_amount = original[row.id].individual_amount;
    }

    function confirmReset() {
      if (!isDirty.value) return;
      resetDialog.value = true;
    }

    function resetAll() {
      for (const row of store.incentives) {
        if (!draft[row.id]) continue;
        draft[row.id].group_amount = original[row.id].group_amount;
        draft[row.id].individual_amount = original[row.id].individual_amount;
      }
      resetDialog.value = false;
    }

    // ---------- FILTERS ----------
    function clearFilters() {
      search.value = "";
      categoryFilter.value = null;
    }

    // ---------- FORMAT HELPERS ----------
    function categoryClass(category) {
      if (!category) return "role-employee";
      return category.toLowerCase().includes("competition")
        ? "role-office"
        : "role-hr";
    }

    // ---------- LIFECYCLE ----------
    onMounted(async () => {
      const result = await store.fetchIncentives();
      if (!result.success) {
        Notify.create({
          type: "negative",
          message: result.message || "Unable to load incentives.",
        });
        return;
      }
      syncDraftFromStore();
    });

    // ---------- RETURN ----------
    return {
      store,
      search,
      categoryFilter,
      categoryOptions,
      clearFilters,
      columns,
      filteredIncentives,
      draft,
      markDirty,
      isDirty,
      isRowDirty,
      revertRow,
      updateAmount,
      saveAll,
      confirmReset,
      resetDialog,
      resetAll,
      categoryClass,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.module-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
}

/* =========================================================
   HEADER
========================================================= */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-header h6 {
  margin: 5px 0 4px;
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.page-header p {
  margin: 0;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-user-btn {
  min-height: 34px;
  padding: 0 14px;
  color: #ffffff;
  background: #e8911a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

/* =========================================================
   INFO BANNER
========================================================= */
.create-info-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 11px 12px;
  color: #356c82;
  background: #edf7fa;
  font-size: var(--fs-sm);
  line-height: var(--lh-relaxed);
}

/* =========================================================
   CARD
========================================================= */
.users-card {
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   FILTER
========================================================= */
.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.search-input {
  flex: 1;
  max-width: 380px;
}
.status-filter {
  width: 200px;
}

.search-input :deep(.q-field__control),
.status-filter :deep(.q-field__control) {
  min-height: 38px;
}

.clear-btn {
  color: #6f8087;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

/* =========================================================
   TABLE
========================================================= */
.table-wrapper {
  padding: 0 12px;
  overflow-x: auto;
}
.users-table {
  box-shadow: none;
  min-width: 900px;
}

.users-table :deep(th) {
  height: 48px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
}

.users-table :deep(td) {
  height: 68px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--fs-base);
  vertical-align: middle;
}

.users-table :deep(tbody tr:hover) {
  background: #fefaf5;
}

.users-table :deep(.q-table__bottom) {
  border-top: 1px solid #edf1ef;
  padding: 8px 12px;
  color: #6f8087;
  font-size: var(--fs-sm);
}

.actions-cell {
  white-space: nowrap;
}
.actions-cell .q-btn {
  margin-left: 1px;
}

/* =========================================================
   AMOUNT INPUT
========================================================= */
.amount-input {
  max-width: 160px;
}

.amount-input :deep(.q-field__control) {
  min-height: 38px;
}

.amount-input :deep(.q-field__native) {
  font-weight: var(--fw-semibold);
  color: #19354a;
}

/* =========================================================
   USER / LEVEL
========================================================= */
.user-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

/* =========================================================
   BADGES
========================================================= */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  white-space: nowrap;
}

.role-hr {
  color: #9b6200;
  background: #fff3d9;
}
.role-office {
  color: #356c82;
  background: #e8f4f8;
}
.role-employee {
  color: #47734f;
  background: #e9f5eb;
}

/* =========================================================
   EMPTY
========================================================= */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 35px 0;
  color: #7d8c93;
  font-size: var(--fs-base);
  text-align: center;
}

/* =========================================================
   BUTTONS
========================================================= */
.dialog-cancel-btn {
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

.danger-btn {
  min-height: 34px;
  padding: 0 16px;
  color: #ffffff;
  background: #d64545;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

/* =========================================================
   CONFIRMATION
========================================================= */
.confirmation-dialog {
  width: 390px;
  max-width: 92vw;
  padding: 28px 25px 22px;
  text-align: center;
}

.confirmation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  margin: 0 auto 15px;
  border-radius: 50%;
}

.status-confirm-icon {
  color: #a96c00;
  background: #fff0d0;
}

.confirmation-title {
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.confirmation-message {
  margin-top: 9px;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-relaxed);
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 22px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 800px) {
  .filter-section {
    flex-wrap: wrap;
  }
  .search-input {
    max-width: none;
    width: 100%;
  }
  .status-filter {
    width: 160px;
  }
}

@media (max-width: 650px) {
  .module-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }
  .add-user-btn {
    flex: 1;
  }

  .users-table {
    min-width: 860px;
  }

  .actions-cell .q-btn {
    width: 36px;
    height: 36px;
  }

  .amount-input :deep(.q-field__native),
  .search-input :deep(.q-field__native),
  .status-filter :deep(.q-field__native) {
    font-size: 16px;
  }
}

@media (max-width: 400px) {
  .confirmation-dialog {
    padding: 22px 18px 18px;
  }
}
</style>
