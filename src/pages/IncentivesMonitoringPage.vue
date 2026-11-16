<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-header-text">
        <h6>Incentive Monitoring</h6>
        <p>
          Track which announced nominations owe an incentive and mark them as
          released.
        </p>
      </div>

      <div class="header-actions">
        <q-btn
          unelevated
          no-caps
          icon="refresh"
          label="Refresh"
          class="refresh-btn"
          :loading="store.isLoading"
          @click="reload"
        />
      </div>
    </section>

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
          placeholder="Search by reference or nominee..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="filterOffice"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Office"
          :options="officeOptions"
          class="status-filter"
        />

        <q-select
          v-model="filterType"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Type"
          :options="typeOptions"
          class="status-filter"
        />

        <q-select
          v-model="filterStatus"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Status"
          :options="statusOptions"
          class="status-filter"
        />

        <q-select
          v-model="filterYear"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Year"
          :options="yearOptions"
          class="status-filter"
        />

        <q-btn
          flat
          no-caps
          icon="filter_alt_off"
          label="Clear"
          class="clear-btn"
          :disable="!hasAnyFilter"
          @click="clearFilters"
        />
      </div>

      <!-- TABLE (cards on small screens, table on large screens) -->
      <div class="table-wrapper">
        <q-table
          v-model:pagination="pagination"
          flat
          :grid="isCompact"
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          :rows-per-page-options="[10, 20, 50]"
          class="users-table"
          :loading="store.isLoading"
          wrap-cells
        >
          <!-- ============ DESKTOP TABLE CELLS ============ -->
          <template #body-cell-no="props">
            <q-td :props="props">{{ rowNumber(props.rowIndex) }}</q-td>
          </template>

          <template #body-cell-reference_no="props">
            <q-td :props="props">
              <div class="user-name">{{ props.row.reference_no || "—" }}</div>
              <div class="cell-sub">{{ props.row.employee || "—" }}</div>
            </q-td>
          </template>

          <template #body-cell-type="props">
            <q-td :props="props">
              <span class="role-badge role-office">
                {{ TYPE_LABELS[props.row.type] || props.row.type || "—" }}
              </span>
            </q-td>
          </template>

          <template #body-cell-incentive="props">
            <q-td :props="props">
              <div class="user-name">
                {{ prettify(props.row.incentive_category) }}
              </div>
              <div class="cell-sub">
                {{ prettify(props.row.incentive_level) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td :props="props">
              <span class="amount-cell">
                {{ formatCurrency(props.row.amount) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                class="role-badge"
                :class="INCENTIVE_STATUS_CLASSES[props.row.status]"
              >
                {{
                  INCENTIVE_STATUS_LABELS[props.row.status] || props.row.status
                }}
              </span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="row-actions">
                <q-btn
                  v-if="props.row.status === 'pending'"
                  flat
                  dense
                  no-caps
                  icon="check_circle"
                  label="Release"
                  class="row-btn row-btn--success"
                  @click="openRelease(props.row)"
                />
                <q-btn
                  v-if="props.row.status === 'pending'"
                  flat
                  dense
                  no-caps
                  icon="cancel"
                  label="Cancel"
                  class="row-btn row-btn--danger"
                  @click="openCancel(props.row)"
                />
              </div>
            </q-td>
          </template>

          <!-- ============ MOBILE / TABLET CARDS ============ -->
          <template #item="props">
            <div class="col-12 col-sm-6 card-col">
              <q-card flat bordered class="incentive-card">
                <div class="incentive-card__head">
                  <div class="incentive-card__title">
                    <div class="user-name">
                      {{ props.row.reference_no || "—" }}
                    </div>
                    <div class="cell-sub">{{ props.row.employee || "—" }}</div>
                  </div>
                  <span
                    class="role-badge"
                    :class="INCENTIVE_STATUS_CLASSES[props.row.status]"
                  >
                    {{
                      INCENTIVE_STATUS_LABELS[props.row.status] ||
                      props.row.status
                    }}
                  </span>
                </div>

                <div class="incentive-card__body">
                  <div class="incentive-card__row">
                    <span class="incentive-card__label">Office</span>
                    <span class="incentive-card__value">
                      {{ props.row.office || "—" }}
                    </span>
                  </div>
                  <div class="incentive-card__row">
                    <span class="incentive-card__label">Type</span>
                    <span class="role-badge role-office">
                      {{ TYPE_LABELS[props.row.type] || props.row.type || "—" }}
                    </span>
                  </div>
                  <div class="incentive-card__row">
                    <span class="incentive-card__label">Incentive</span>
                    <span class="incentive-card__value">
                      {{ prettify(props.row.incentive_category) }}
                      <span class="cell-sub">
                        · {{ prettify(props.row.incentive_level) }}
                      </span>
                    </span>
                  </div>
                  <div class="incentive-card__row">
                    <span class="incentive-card__label">Amount</span>
                    <span class="amount-cell">
                      {{ formatCurrency(props.row.amount) }}
                    </span>
                  </div>
                </div>

                <div
                  v-if="props.row.status === 'pending'"
                  class="incentive-card__actions"
                >
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="check_circle"
                    label="Release"
                    class="row-btn row-btn--success"
                    @click="openRelease(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="cancel"
                    label="Cancel"
                    class="row-btn row-btn--danger"
                    @click="openCancel(props.row)"
                  />
                </div>
              </q-card>
            </div>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="receipt_long" size="34px" />
              <div>No incentive payouts found.</div>
            </div>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- =====================================================
         RELEASE DIALOG
    ====================================================== -->
    <q-dialog v-model="showReleaseDialog" persistent>
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon status-confirm-icon">
          <q-icon name="check_circle" size="25px" />
        </div>
        <div class="confirmation-title">Release incentive?</div>
        <div class="confirmation-message">
          <strong>{{ activeRow?.employee }}</strong
          >'s
          <strong>{{ prettify(activeRow?.incentive_category) }}</strong>
          incentive of
          <strong>{{ formatCurrency(activeRow?.amount) }}</strong>
          will be marked as <strong>released</strong>. This records your name
          and the current time.
        </div>

        <div class="confirmation-form">
          <q-input
            v-model="releaseRemarks"
            type="textarea"
            outlined
            autogrow
            :rows="2"
            maxlength="1000"
            counter
            label="Remarks (optional)"
            placeholder="e.g. Handed to nominee at HR office"
          />
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            :disable="releasing"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            label="Release"
            class="success-btn"
            :loading="releasing"
            @click="confirmRelease"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         CANCEL DIALOG
    ====================================================== -->
    <q-dialog v-model="showCancelDialog" persistent>
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon danger-confirm-icon">
          <q-icon name="cancel" size="25px" />
        </div>
        <div class="confirmation-title">Cancel incentive?</div>
        <div class="confirmation-message">
          This will permanently cancel the incentive for
          <strong>{{ activeRow?.employee }}</strong
          >. A reason is required.
        </div>

        <div class="confirmation-form">
          <q-input
            v-model="cancelRemarks"
            type="textarea"
            outlined
            autogrow
            :rows="3"
            maxlength="1000"
            counter
            label="Reason"
            :error="!!cancelError"
            :error-message="cancelError"
          />
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Back"
            class="dialog-cancel-btn"
            :disable="cancelling"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            label="Cancel incentive"
            class="danger-btn"
            :loading="cancelling"
            @click="confirmCancel"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { Notify, useQuasar } from "quasar";
import { useIncentiveMonitoringStore } from "src/stores/incentiveMonitoringStore";
import { TYPE_LABELS } from "src/constants/NominationConfig";

const INCENTIVE_STATUS_LABELS = {
  pending: "Pending",
  released: "Released",
  cancelled: "Cancelled",
};

const INCENTIVE_STATUS_CLASSES = {
  pending: "role-hr",
  released: "role-employee",
  cancelled: "role-danger",
};

export default defineComponent({
  name: "IncentivesMonitoringPage",

  setup() {
    const $q = useQuasar();
    const store = useIncentiveMonitoringStore();

    const search = ref("");
    const filterOffice = ref(null);
    const filterType = ref(null);
    const filterStatus = ref(null);
    const filterYear = ref(null);

    // table pagination (reactive so sorting / paging works)
    const pagination = ref({ page: 1, rowsPerPage: 10 });

    // below 1024px the table becomes cards, so nothing scrolls sideways
    const isCompact = computed(() => $q.screen.lt.md);

    // dialogs
    const showReleaseDialog = ref(false);
    const showCancelDialog = ref(false);
    const activeRow = ref(null);
    const releaseRemarks = ref("");
    const cancelRemarks = ref("");
    const cancelError = ref("");
    const releasing = ref(false);
    const cancelling = ref(false);

    // ---------- columns ----------
    const columns = [
      { name: "no", label: "NO.", field: "id", align: "left" },
      {
        name: "reference_no",
        label: "NOMINEE",
        field: "reference_no",
        align: "left",
        sortable: true,
      },
      { name: "type", label: "TYPE", field: "type", align: "left" },
      {
        name: "incentive",
        label: "INCENTIVE",
        field: "incentive_category",
        align: "left",
      },
      { name: "amount", label: "AMOUNT", field: "amount", align: "left" },
      {
        name: "status",
        label: "STATUS",
        field: "status",
        align: "left",
        sortable: true,
      },

      { name: "actions", label: "", field: "actions", align: "right" },
    ];

    // ---------- options ----------
    const officeOptions = computed(() => {
      const set = new Set(store.rows.map((r) => r.office).filter((o) => !!o));
      return Array.from(set)
        .sort()
        .map((o) => ({ label: o, value: o }));
    });

    const typeOptions = computed(() => {
      const set = new Set(store.rows.map((r) => r.type).filter((t) => !!t));
      return Array.from(set)
        .sort()
        .map((t) => ({ label: TYPE_LABELS[t] || t, value: t }));
    });

    const statusOptions = [
      { label: "Pending", value: "pending" },
      { label: "Released", value: "released" },
      { label: "Cancelled", value: "cancelled" },
    ];

    const yearOptions = computed(() => {
      const set = new Set();
      store.rows.forEach((r) => {
        if (r.released_at) set.add(new Date(r.released_at).getFullYear());
      });
      const now = new Date().getFullYear();
      set.add(now);
      return Array.from(set)
        .sort((a, b) => b - a)
        .map((y) => ({ label: String(y), value: y }));
    });

    // ---------- filters ----------
    const hasAnyFilter = computed(
      () =>
        !!search.value ||
        !!filterOffice.value ||
        !!filterType.value ||
        !!filterStatus.value ||
        !!filterYear.value
    );

    const filteredRows = computed(() => {
      let rows = store.rows;
      const keyword = search.value?.toLowerCase().trim();

      if (keyword) {
        rows = rows.filter(
          (r) =>
            r.reference_no?.toLowerCase().includes(keyword) ||
            r.employee?.toLowerCase().includes(keyword)
        );
      }
      if (filterOffice.value)
        rows = rows.filter((r) => r.office === filterOffice.value);
      if (filterType.value)
        rows = rows.filter((r) => r.type === filterType.value);
      if (filterStatus.value)
        rows = rows.filter((r) => r.status === filterStatus.value);
      if (filterYear.value) {
        rows = rows.filter((r) => {
          if (!r.released_at) return false;
          return new Date(r.released_at).getFullYear() === filterYear.value;
        });
      }
      return rows;
    });

    // continuous row numbering across pages
    function rowNumber(rowIndex) {
      const { page, rowsPerPage } = pagination.value;
      if (!rowsPerPage) return rowIndex + 1;
      return (page - 1) * rowsPerPage + rowIndex + 1;
    }

    // ---------- lifecycle ----------
    onMounted(reload);

    async function reload() {
      const result = await store.fetch();
      if (!result.success) {
        Notify.create({ type: "negative", message: result.message });
      }
    }

    // ---------- actions ----------
    function openRelease(row) {
      activeRow.value = row;
      releaseRemarks.value = "";
      showReleaseDialog.value = true;
    }

    async function confirmRelease() {
      if (!activeRow.value) return;
      releasing.value = true;
      const result = await store.release(
        activeRow.value.id,
        releaseRemarks.value?.trim() || null
      );
      releasing.value = false;

      if (!result.success) {
        Notify.create({ type: "negative", message: result.message });
        return;
      }
      Notify.create({ type: "positive", message: result.message });
      showReleaseDialog.value = false;
      activeRow.value = null;
    }

    function openCancel(row) {
      activeRow.value = row;
      cancelRemarks.value = "";
      cancelError.value = "";
      showCancelDialog.value = true;
    }

    async function confirmCancel() {
      const reason = cancelRemarks.value?.trim() || "";
      if (!reason) {
        cancelError.value = "Please provide a reason.";
        return;
      }
      if (!activeRow.value) return;

      cancelling.value = true;
      const result = await store.cancel(activeRow.value.id, reason);
      cancelling.value = false;

      if (!result.success) {
        Notify.create({ type: "negative", message: result.message });
        return;
      }
      Notify.create({ type: "positive", message: result.message });
      showCancelDialog.value = false;
      activeRow.value = null;
    }

    function clearFilters() {
      search.value = "";
      filterOffice.value = null;
      filterType.value = null;
      filterStatus.value = null;
      filterYear.value = null;
    }

    // ---------- formatters ----------
    function formatCurrency(value) {
      if (value === null || value === undefined) return "—";
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(Number(value));
    }

    function formatDate(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    function prettify(value) {
      if (!value) return "—";
      return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return {
      store,
      columns,
      pagination,
      isCompact,
      search,
      filterOffice,
      filterType,
      filterStatus,
      filterYear,
      officeOptions,
      typeOptions,
      statusOptions,
      yearOptions,
      hasAnyFilter,
      filteredRows,
      TYPE_LABELS,
      INCENTIVE_STATUS_LABELS,
      INCENTIVE_STATUS_CLASSES,
      showReleaseDialog,
      showCancelDialog,
      activeRow,
      releaseRemarks,
      cancelRemarks,
      cancelError,
      releasing,
      cancelling,
      reload,
      rowNumber,
      openRelease,
      confirmRelease,
      openCancel,
      confirmCancel,
      clearFilters,
      formatCurrency,
      formatDate,
      prettify,
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
  min-width: 0;
  max-width: 100%;
  padding: 20px;
  color: #19354a;
  box-sizing: border-box;
}

/* =========================================================
   HEADER
========================================================= */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.page-header-text {
  min-width: 0;
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
  flex-shrink: 0;
  gap: 8px;
}

.refresh-btn {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid #d6dce1;
  color: #2b3a4a;
  background: #ffffff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

/* =========================================================
   CARD
========================================================= */
.users-card {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   FILTER
========================================================= */
.filter-section {
  display: grid;
  grid-template-columns: minmax(200px, 1.6fr) repeat(4, minmax(0, 1fr)) auto;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.search-input,
.status-filter {
  width: 100%;
  min-width: 0;
}

.search-input :deep(.q-field__control),
.status-filter :deep(.q-field__control) {
  min-height: 38px;
}

.clear-btn {
  color: #6f8087;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  justify-self: start;
}

/* =========================================================
   TABLE (fits the container, no horizontal scroll)
========================================================= */
.table-wrapper {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 0 12px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.users-table {
  width: 100%;
  max-width: 100%;
  box-shadow: none;
}

.users-table :deep(.q-table__middle) {
  overflow-x: hidden;
}

.users-table :deep(table.q-table) {
  width: 100%;
  table-layout: auto;
}

.users-table :deep(th) {
  height: 48px;
  padding: 0 10px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
}

.users-table :deep(td) {
  height: 68px;
  padding: 8px 10px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--fs-base);
  vertical-align: middle;
  overflow-wrap: anywhere;
}

.users-table :deep(tbody tr:hover) {
  background: #fefaf5;
}

.users-table :deep(.q-table__bottom) {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px 12px;
  border-top: 1px solid #edf1ef;
  padding: 8px 12px;
  color: #6f8087;
  font-size: var(--fs-sm);
}

.user-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.cell-sub {
  color: #7a8792;
  font-size: var(--fs-sm);
  margin-top: 2px;
}

.amount-cell {
  color: #19354a;
  font-weight: var(--fw-bold);
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
.role-danger {
  color: #8b2c2c;
  background: #f6d5d5;
}

/* =========================================================
   ROW ACTIONS
========================================================= */
.row-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.row-btn {
  min-height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}

.row-btn--success {
  color: #0c9145;
  background: #e1f7e6;
}

.row-btn--danger {
  color: #c73f3f;
  background: #fbe9e9;
}

/* =========================================================
   MOBILE / TABLET CARDS
========================================================= */
.card-col {
  padding: 6px;
  box-sizing: border-box;
}

.incentive-card {
  height: 100%;
  padding: 14px;
  border-color: #edf1ef;
  border-radius: 10px;
  background: #ffffff;
}

.incentive-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf1ef;
}

.incentive-card__title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.incentive-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
}

.incentive-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--fs-base);
}

.incentive-card__label {
  flex-shrink: 0;
  color: #6f8087;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.incentive-card__value {
  min-width: 0;
  color: #425b68;
  text-align: right;
  overflow-wrap: anywhere;
}

.incentive-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #edf1ef;
}

.incentive-card__actions .row-btn {
  flex: 1 1 120px;
  min-height: 34px;
}

/* =========================================================
   EMPTY STATE
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
   DIALOG
========================================================= */
.confirmation-dialog {
  width: 420px;
  max-width: 92vw;
  max-height: 92vh;
  overflow-y: auto;
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
  color: #0c9145;
  background: #e1f7e6;
}

.danger-confirm-icon {
  color: #c73f3f;
  background: #fbe9e9;
}

.confirmation-title {
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
}

.confirmation-message {
  margin-top: 9px;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-relaxed);
  overflow-wrap: anywhere;
}

.confirmation-form {
  margin-top: 16px;
  text-align: left;
}

.confirmation-form :deep(.q-field__native),
.confirmation-form :deep(textarea) {
  font-size: 16px;
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.dialog-cancel-btn {
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

.success-btn {
  min-height: 34px;
  padding: 0 16px;
  color: #ffffff;
  background: #0c9145;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
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
   RESPONSIVE
========================================================= */

/* Laptop / small desktop */
@media (max-width: 1200px) {
  .filter-section {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .search-input {
    grid-column: 1 / -1;
  }
}

/* Tablet */
@media (max-width: 800px) {
  .filter-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 12px 14px;
  }

  .clear-btn {
    grid-column: 1 / -1;
    justify-self: stretch;
  }

  .table-wrapper {
    padding: 0 8px;
  }
}

/* Mobile */
@media (max-width: 650px) {
  .module-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .refresh-btn {
    flex: 1;
  }

  .filter-section {
    grid-template-columns: 1fr;
  }

  .users-table :deep(.q-table__bottom) {
    justify-content: center;
  }

  .confirmation-dialog {
    padding: 22px 18px 18px;
  }

  .confirmation-actions {
    flex-direction: column-reverse;
  }

  .confirmation-actions .q-btn {
    width: 100%;
  }
}
</style>
