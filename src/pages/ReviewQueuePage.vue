<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-header-text">
        <h6 class="page-title">Review Queue</h6>
        <p class="page-subtitle">
          All nominations across offices. Drafts are excluded.
        </p>
      </div>

      <q-btn
        unelevated
        no-caps
        icon="refresh"
        label="Refresh"
        class="header-btn header-btn--secondary"
        :loading="nominationStore.isLoading"
        @click="reload"
      />
    </section>

    <!-- =====================================================
         TABLE CARD
    ====================================================== -->
    <q-card flat class="nominations-card">
      <!-- Filters -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by nominee, reference or details..."
          class="filter-search"
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
          class="filter-select filter-select--wide"
        />

        <q-select
          v-model="filterType"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Type"
          :options="typeFilterOptions"
          class="filter-select"
        />

        <q-select
          v-model="filterStatus"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Status"
          :options="STATUS_OPTIONS"
          class="filter-select"
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

      <!-- Table (desktop) / Cards (tablet + mobile) -->
      <div class="table-wrapper">
        <q-table
          flat
          :grid="isCompact"
          :rows="filteredRows"
          :columns="columns"
          :visible-columns="visibleColumns"
          :table-style="tableStyle"
          row-key="id"
          :loading="nominationStore.isLoading"
          class="nominations-table"
          card-container-class="nomination-cards"
          v-model:pagination="pagination"
          :rows-per-page-options="[5, 10, 25, 50, 100]"
          hide-header-on-grid
          wrap-cells
          @row-click="(evt, row) => openReview(row.id)"
        >
          <!-- ============ DESKTOP CELLS ============ -->
          <template #body-cell-no="props">
            <q-td :props="props" class="cell-no">
              {{ rowNumber(props.rowIndex) }}
            </q-td>
          </template>

          <template #body-cell-nominee="props">
            <q-td :props="props">
              <div class="cell-title">
                {{ props.row.employee }}
                <span v-if="props.row.is_office" class="office-tag">
                  Office
                </span>
              </div>
            </q-td>
          </template>

          <template #body-cell-office="props">
            <q-td :props="props">
              <div class="cell-office">{{ props.row.office }}</div>
            </q-td>
          </template>

          <template #body-cell-type="props">
            <q-td :props="props">
              <span class="type-badge" :class="TYPE_CLASSES[props.row.type]">
                {{ TYPE_LABELS[props.row.type] }}
              </span>
            </q-td>
          </template>

          <template #body-cell-details="props">
            <q-td :props="props">
              <div class="cell-details">
                {{ detailsSummary(props.row) || "—" }}
              </div>
            </q-td>
          </template>

          <template #body-cell-status_updated="props">
            <q-td :props="props">
              <div
                class="cell-date cell-date--updated"
                :title="fullDate(props.row.last_status_changed_at)"
              >
                <q-icon name="update" size="13px" class="cell-date-icon" />
                {{ formatDate(props.row.last_status_changed_at) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                class="status-badge"
                :class="STATUS_CLASSES[props.row.status]"
              >
                {{ STATUS_LABELS[props.row.status] }}
              </span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="cell-actions">
              <div class="row-actions">
                <q-btn
                  v-for="action in rowActions(props.row)"
                  :key="action.key"
                  unelevated
                  no-caps
                  dense
                  :icon="action.icon"
                  :label="action.label"
                  class="act-btn"
                  :class="`act-btn--${action.tone}`"
                  @click.stop="action.onClick"
                />
              </div>
            </q-td>
          </template>

          <!-- ============ TABLET / MOBILE CARD ============ -->
          <template #item="props">
            <article
              class="nomination-card"
              role="button"
              tabindex="0"
              :aria-label="`Open nomination for ${props.row.employee}`"
              @click="openReview(props.row.id)"
              @keydown.enter.self="openReview(props.row.id)"
              @keydown.space.self.prevent="openReview(props.row.id)"
            >
              <header class="card-top">
                <div class="card-nominee">
                  <span class="card-index">
                    {{ rowNumber(props.rowIndex) }}
                  </span>
                  <span class="card-name">{{ props.row.employee }}</span>
                  <span v-if="props.row.is_office" class="office-tag">
                    Office
                  </span>
                </div>

                <span
                  class="status-badge"
                  :class="STATUS_CLASSES[props.row.status]"
                >
                  {{ STATUS_LABELS[props.row.status] }}
                </span>
              </header>

              <div class="card-office">
                <q-icon name="business" size="14px" />
                <span>{{ props.row.office }}</span>
              </div>

              <div class="card-meta">
                <span class="type-badge" :class="TYPE_CLASSES[props.row.type]">
                  {{ TYPE_LABELS[props.row.type] }}
                </span>
                <span
                  class="card-date card-date--updated"
                  :title="fullDate(props.row.last_status_changed_at)"
                >
                  <q-icon name="update" size="16px" />
                  {{ formatDate(props.row.last_status_changed_at) }}
                </span>
              </div>

              <p class="card-details">
                {{ detailsSummary(props.row) || "—" }}
              </p>

              <footer class="card-actions">
                <q-btn
                  v-for="action in rowActions(props.row)"
                  :key="action.key"
                  unelevated
                  no-caps
                  dense
                  :icon="action.icon"
                  :label="action.label"
                  class="act-btn"
                  :class="`act-btn--${action.tone}`"
                  @click.stop="action.onClick"
                />
              </footer>
            </article>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="inbox" size="34px" />
              <div>No nominations found.</div>
            </div>
          </template>

          <!-- Pagination footer -->
          <template #bottom="scope">
            <div class="table-footer">
              <div class="footer-summary">
                Showing
                <strong
                  >{{ filteredRows.length === 0 ? 0 : rangeStart }}–{{
                    rangeEnd
                  }}</strong
                >
                of <strong>{{ filteredRows.length }}</strong>
                nominations
              </div>

              <div class="footer-controls">
                <div class="footer-rpp">
                  <span class="rpp-label">Rows per page:</span>
                  <q-select
                    v-model="pagination.rowsPerPage"
                    :options="rppOptions"
                    dense
                    borderless
                    emit-value
                    map-options
                    options-dense
                    class="rpp-select"
                  />
                </div>

                <div class="footer-nav">
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="chevron_left"
                    aria-label="Previous page"
                    :disable="scope.isFirstPage"
                    @click="goToPage(scope.pagination.page - 1)"
                  />
                  <span class="page-counter">
                    Page <strong>{{ scope.pagination.page }}</strong> of
                    <strong>{{ Math.max(scope.pagesNumber, 1) }}</strong>
                  </span>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="chevron_right"
                    aria-label="Next page"
                    :disable="scope.isLastPage"
                    @click="goToPage(scope.pagination.page + 1)"
                  />
                </div>
              </div>
            </div>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- =====================================================
         START REVIEW CONFIRMATION
    ====================================================== -->
    <q-dialog v-model="showStartDialog" persistent>
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon is-warning">
          <q-icon name="fact_check" size="25px" />
        </div>

        <div class="confirmation-title">Start review?</div>

        <div class="confirmation-message">
          <strong>{{ rowToStart?.employee }}</strong
          >'s nomination will move from <strong>Submitted</strong> to
          <strong>Under Review</strong>.
          <span class="confirmation-note">
            You can then return, reject or request the signed form.
          </span>
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            :disable="starting"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            label="Start review"
            class="dialog-confirm-btn is-primary"
            :loading="starting"
            @click="confirmStartReview"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useNominationStore } from "src/stores/nominationStore";
import {
  NOMINATION_TYPES,
  TYPE_LABELS,
  TYPE_CLASSES,
  STATUS_LABELS,
  STATUS_CLASSES,
  STATUS_OPTIONS,
  detailsSummary,
} from "src/constants/NominationConfig";

const RPP_OPTIONS = [
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

// Every column has a base width (px), applied to header and cells.
// The table uses `table-layout: fixed`, so these widths are what count.
// When the table is wider than the sum, the extra space is shared out
// proportionally, so the columns grow evenly and never overlap.
const w = (width) => ({
  style: `width: ${width}px`,
  headerStyle: `width: ${width}px`,
  width,
});

const COLUMNS = [
  { name: "no", label: "NO.", field: "no", align: "left", ...w(52) },
  {
    name: "nominee",
    label: "NOMINEE",
    field: "employee",
    align: "left",
    ...w(170),
  },
  {
    name: "office",
    label: "OFFICE",
    field: "office",
    align: "left",
    ...w(180),
  },
  { name: "type", label: "TYPE", field: "type", align: "left", ...w(130) },
  {
    name: "details",
    label: "DETAILS",
    field: "details",
    align: "left",
    ...w(220),
  },
  {
    name: "status_updated",
    label: "STATUS UPDATED",
    field: "last_status_changed_at",
    align: "left",
    sortable: true,
    ...w(140),
  },
  {
    name: "status",
    label: "STATUS",
    field: "status",
    align: "left",
    ...w(140),
  },
  {
    name: "actions",
    label: "ACTIONS",
    field: "actions",
    align: "right",
    ...w(120),
  },
];

// Columns hidden on smaller desktops (still visible on the review page)
const HIDDEN_ON_SMALL_DESKTOP = ["no", "details"];

export default defineComponent({
  name: "HrNominationsPage",

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const nominationStore = useNominationStore();

    // ---------- State ----------
    // Filters
    const search = ref("");
    const filterOffice = ref(null);
    const filterType = ref(null);
    const filterStatus = ref(null);

    // Client-side pagination — do NOT set rowsNumber.
    const pagination = ref({
      page: 1,
      rowsPerPage: 5,
      sortBy: null,
      descending: false,
    });

    // Start-review confirmation
    const showStartDialog = ref(false);
    const rowToStart = ref(null);
    const starting = ref(false);

    const typeFilterOptions = NOMINATION_TYPES.map((t) => ({
      label: t.short,
      value: t.value,
    }));

    // ---------- Responsive ----------
    // Quasar breakpoints: xs < 600, sm < 1024, md < 1440, lg < 1920.
    // Below 1024px the table becomes a list of cards.
    const isCompact = computed(() => $q.screen.lt.md);

    const visibleColumns = computed(() =>
      $q.screen.lt.lg
        ? COLUMNS.filter((c) => !HIDDEN_ON_SMALL_DESKTOP.includes(c.name)).map(
            (c) => c.name
          )
        : COLUMNS.map((c) => c.name)
    );

    // Table never gets narrower than the sum of its visible columns;
    // the wrapper scrolls sideways instead of letting columns overlap.
    const tableStyle = computed(() => {
      if (isCompact.value) return undefined;
      const total = COLUMNS.filter((c) =>
        visibleColumns.value.includes(c.name)
      ).reduce((sum, c) => sum + c.width, 0);
      return { minWidth: `${total}px` };
    });

    // ---------- Derived data ----------
    const allRows = computed(() => nominationStore.nominations);

    const officeOptions = computed(() => {
      const offices = new Set();
      allRows.value.forEach((r) => {
        if (r.office) offices.add(r.office);
      });
      return Array.from(offices)
        .sort()
        .map((name) => ({ label: name, value: name }));
    });

    const hasAnyFilter = computed(
      () =>
        !!search.value ||
        !!filterOffice.value ||
        !!filterType.value ||
        !!filterStatus.value
    );

    const filteredRows = computed(() => {
      let result = allRows.value;
      const keyword = search.value?.toLowerCase().trim();

      if (keyword) {
        result = result.filter(
          (r) =>
            r.employee?.toLowerCase().includes(keyword) ||
            r.reference_no?.toLowerCase().includes(keyword) ||
            detailsSummary(r).toLowerCase().includes(keyword)
        );
      }
      if (filterOffice.value) {
        result = result.filter((r) => r.office === filterOffice.value);
      }
      if (filterType.value) {
        result = result.filter((r) => r.type === filterType.value);
      }
      if (filterStatus.value) {
        result = result.filter((r) => r.status === filterStatus.value);
      }
      return result;
    });

    const rangeStart = computed(() => {
      if (filteredRows.value.length === 0) return 0;
      return (pagination.value.page - 1) * pagination.value.rowsPerPage + 1;
    });

    const rangeEnd = computed(() =>
      Math.min(
        pagination.value.page * pagination.value.rowsPerPage,
        filteredRows.value.length
      )
    );

    // ---------- Watchers ----------
    watch([search, filterOffice, filterType, filterStatus], () => {
      pagination.value.page = 1;
    });

    // Keep the page number valid when the result set shrinks
    watch(
      () => filteredRows.value.length,
      (total) => {
        const maxPage = Math.max(
          1,
          Math.ceil(total / pagination.value.rowsPerPage)
        );
        if (pagination.value.page > maxPage) {
          pagination.value.page = maxPage;
        }
      }
    );

    // ---------- Lifecycle ----------
    onMounted(reload);

    async function reload() {
      const result = await nominationStore.fetchForHr();
      if (!result.success) notify(result.message, "negative");
    }

    // ---------- Helpers ----------
    function notify(message, type = "positive") {
      $q.notify({ type, message, position: "top" });
    }

    function rowNumber(indexInPage) {
      return (
        (pagination.value.page - 1) * pagination.value.rowsPerPage +
        indexInPage +
        1
      );
    }

    function goToPage(page) {
      pagination.value.page = page;
    }

    /** Plain date, no relative wording — "Oct 14, 2026". */
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

    /** Full timestamp for the tooltip. */
    function fullDate(iso) {
      if (!iso) return "No status change yet";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    function clearFilters() {
      search.value = "";
      filterOffice.value = null;
      filterType.value = null;
      filterStatus.value = null;
    }

    // ---------- Row actions ----------
    // One source of truth for the button shown in both the desktop
    // table and the mobile cards. Same look as My Nominations:
    // accent for rows the reviewer can act on, neutral for view-only.
    const ACTION_LABELS = {
      submitted: "Review",
      review: "Continue",
      hardcopy_submitted: "Approve",
    };

    function isActionable(row) {
      return row.status in ACTION_LABELS;
    }

    function rowActions(row) {
      const actionable = isActionable(row);

      return [
        {
          key: "open",
          label: ACTION_LABELS[row.status] || "View",
          icon: actionable ? "fact_check" : "visibility",
          tone: actionable ? "accent" : "neutral",
          onClick: () => openReview(row.id),
        },
      ];
    }

    // ---------- Navigation ----------
    function goToReview(id) {
      router.push({ name: "review_nomination", params: { id } });
    }

    // A `submitted` row asks for confirmation before moving to `review`.
    function openReview(id) {
      const row = nominationStore.getById(id);
      if (!row) return;

      if (row.status === "submitted") {
        rowToStart.value = row;
        showStartDialog.value = true;
        return;
      }

      goToReview(id);
    }

    async function confirmStartReview() {
      if (!rowToStart.value) return;

      starting.value = true;
      const id = rowToStart.value.id;
      const res = await nominationStore.review(id);
      starting.value = false;

      if (!res.success) {
        notify(res.message, "negative");
        return;
      }

      showStartDialog.value = false;
      rowToStart.value = null;
      goToReview(id);
    }

    return {
      // stores / config
      nominationStore,
      columns: COLUMNS,
      rppOptions: RPP_OPTIONS,
      typeFilterOptions,
      officeOptions,
      TYPE_LABELS,
      TYPE_CLASSES,
      STATUS_LABELS,
      STATUS_CLASSES,
      STATUS_OPTIONS,

      // table state
      search,
      filterOffice,
      filterType,
      filterStatus,
      pagination,
      isCompact,
      visibleColumns,
      tableStyle,
      hasAnyFilter,
      filteredRows,
      rangeStart,
      rangeEnd,

      // dialog
      showStartDialog,
      rowToStart,
      starting,

      // helpers
      detailsSummary,
      rowNumber,
      goToPage,
      formatDate,
      fullDate,
      clearFilters,
      rowActions,

      // actions
      reload,
      openReview,
      confirmStartReview,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   RESPONSIVE STRATEGY (shared with My Nominations)
   - Mobile-first: base = phone, min-width queries enhance
     (600 / 800 / 1024 / 1440).
   - < 1024px: the table becomes cards (no horizontal scroll).
   - >= 1024px: fixed table layout. Narrow columns keep a base
     width; nominee / office / details share the remaining space.
   - 16px inputs + 40–44px tap targets on phones; hover only
     on hover-capable devices.
========================================================= */

/* =========================================================
   PAGE
========================================================= */
.module-page {
  min-height: 100%;
  padding: clamp(12px, 2.5vw, 20px);
  padding-left: max(clamp(12px, 2.5vw, 20px), env(safe-area-inset-left));
  padding-right: max(clamp(12px, 2.5vw, 20px), env(safe-area-inset-right));
  padding-bottom: max(clamp(12px, 2.5vw, 20px), env(safe-area-inset-bottom));
  color: #19354a;
  overflow-x: clip;
}

/* =========================================================
   HEADER (mobile: stacked, full-width button)
========================================================= */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-bottom: clamp(12px, 2vw, 18px);
}

.page-header-text {
  min-width: 0;
}

.page-title {
  margin: 5px 0 4px;
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.page-subtitle {
  margin: 0;
  max-width: 60ch;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

.header-btn {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.header-btn--secondary {
  border: 1px solid #d6dce1;
  color: #2b3a4a;
  background: #ffffff;
}

/* =========================================================
   CARD
========================================================= */
.nominations-card {
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   FILTERS (mobile: 2-col grid, search on top)
========================================================= */
.filter-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.filter-search {
  grid-column: 1 / -1;
  min-width: 0;
}

.filter-select {
  min-width: 0;
}

.filter-select--wide {
  grid-column: 1 / -1;
}

.clear-btn {
  grid-column: 1 / -1;
  justify-self: start;
  color: #6f8087;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

.clear-btn:disabled {
  opacity: 0.45;
}

.filter-search :deep(.q-field__control),
.filter-select :deep(.q-field__control) {
  min-height: 44px;
}

/* 16px prevents iOS Safari from zooming when a field is focused */
.filter-search :deep(.q-field__native),
.filter-select :deep(.q-field__native),
.rpp-select :deep(.q-field__native) {
  font-size: 16px;
}

/* =========================================================
   TABLE
========================================================= */
.table-wrapper {
  padding: 0 clamp(8px, 1.5vw, 12px);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.nominations-table {
  box-shadow: none;
  background: transparent;
}

/* Fixed layout: column widths come from COLUMNS (px for narrow columns,
   shared remaining space for nominee / office / details). */
.nominations-table :deep(table) {
  width: 100%;
  table-layout: fixed;
}

.nominations-table :deep(th),
.nominations-table :deep(td) {
  padding-left: 12px;
  padding-right: 12px;
  overflow: hidden; /* a cell can never paint over its neighbour */
}

.nominations-table :deep(th) {
  height: 48px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  border-bottom: 1px solid #edf1ef;
}

.nominations-table :deep(td) {
  height: 68px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--fs-base);
  vertical-align: middle;
}

.nominations-table :deep(tbody tr) {
  cursor: pointer;
  transition: background 0.12s ease;
}

/* In the table, badges wrap inside their column instead of overflowing */
.nominations-table .type-badge,
.nominations-table .status-badge {
  max-width: 100%;
  white-space: normal;
  border-radius: 12px;
  text-align: left;
}

.cell-no {
  color: #7d8c93;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}

.cell-title {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  overflow-wrap: anywhere;
}

/* Widths are controlled by the column, so text just wraps inside it */
.cell-office {
  color: #5c6b78;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-details {
  color: #425b68;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #5c6b78;
  font-size: var(--fs-base);
  white-space: nowrap;
}

.cell-date--updated {
  color: #2b5f8a;
  font-weight: var(--fw-semibold);
}

.cell-date-icon {
  color: #7fa4c5;
}

.office-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 10px;
  color: #0f766e;
  background: #d7f0ed;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  vertical-align: middle;
}

/* =========================================================
   BADGES
========================================================= */
.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge {
  gap: 5px;
}

.type-exam {
  color: #0c7cb5;
  background: #e6f3fb;
}
.type-award {
  color: #7a4fb8;
  background: #f1eafa;
}
.type-graduate {
  color: #d4880f;
  background: #fef6ea;
}
.type-gawad {
  color: #b0446b;
  background: #fbeaf1;
}

.status-draft {
  color: #6b7680;
  background: #eef1f4;
}
.status-submitted,
.status-hardcopy {
  color: #1c6ea4;
  background: #e6f0fa;
}
.status-review {
  color: #d4880f;
  background: #fef6ea;
}
.status-returned {
  color: #c73f3f;
  background: #fbe9e9;
}
.status-awaiting {
  color: #8a5a1a;
  background: #fff2dc;
}
.status-approved {
  color: #0c9145;
  background: #e1f7e6;
}
.status-rejected {
  color: #8b2c2c;
  background: #f6d5d5;
}
.status-announced {
  color: #0f766e;
  background: #d7f0ed;
}

/* =========================================================
   ROW ACTIONS — labeled buttons, shared by table + cards
   Tones: neutral (grey) · accent (orange) · danger (red)
   Table cell: buttons wrap into a second row when space is tight.
   Cards: buttons share the row and grow to fill it.
========================================================= */
.cell-actions {
  white-space: normal;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 100%;
  margin-left: auto;
}

.act-btn {
  flex-shrink: 0; /* never squeeze a button narrower than its content */
  min-height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  text-transform: none;
  white-space: nowrap;
  transition: background 0.12s ease, color 0.12s ease;
}

/* Quasar lets icon + label wrap onto two lines; keep them side by side */
.act-btn :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.act-btn--neutral {
  color: #52646f;
  background: #f3f6f5;
}

.act-btn--accent {
  color: #b46e0a;
  background: #fef6ea;
}

.act-btn--danger {
  color: #c73f3f;
  background: #fbe9e9;
}

/* =========================================================
   CARD LIST (tablet + mobile, < 1024px)
   Mobile: 1 column. Tablet (>= 600px): 2 columns.
========================================================= */
.nominations-table :deep(.nomination-cards) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  padding: 12px 0;
}

.nomination-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 14px;
  border: 1px solid #edf1ef;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.nomination-card:active {
  background: #fefaf5;
}

.nomination-card:focus-visible {
  outline: 2px solid #e8911a;
  outline-offset: 2px;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.card-nominee {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.card-nominee .office-tag {
  margin-left: 0;
}

.card-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  color: #7d8c93;
  background: #f3f6f5;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}

.card-name {
  min-width: 0;
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  overflow-wrap: anywhere;
}

.card-top .status-badge {
  flex-shrink: 0;
}

.card-office {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #5c6b78;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
  overflow-wrap: anywhere;
}

.card-office .q-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #97a1a9;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.card-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #5c6b78;
  font-size: var(--fs-sm);
}

.card-date--updated {
  color: #2b5f8a;
  font-weight: var(--fw-semibold);
}

/* Clamped to 3 lines so cards stay evenly sized */
.card-details {
  display: -webkit-box;
  margin: 0;
  color: #425b68;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #edf1ef;
}

.card-actions .act-btn {
  flex: 1 1 auto;
  min-height: 40px;
  justify-content: center;
}

/* =========================================================
   EMPTY STATE
========================================================= */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 35px 0;
  color: #7d8c93;
  font-size: var(--fs-base);
  text-align: center;
}

/* =========================================================
   PAGINATION FOOTER (mobile: stacked)
========================================================= */
.table-footer {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  width: 100%;
  padding: 10px 4px;
  border-top: 1px solid #edf1ef;
  background: #ffffff;
}

.footer-summary {
  color: #6f8087;
  font-size: var(--fs-sm);
  text-align: center;
}

.footer-summary strong {
  color: #405967;
  font-weight: var(--fw-bold);
}

.footer-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
}

.footer-rpp {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rpp-label {
  color: #6f8087;
  font-size: var(--fs-sm);
}

.rpp-select {
  min-width: 68px;
}

.rpp-select :deep(.q-field__native) {
  color: #405967;
  font-weight: var(--fw-semibold);
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5c6b78;
}

.footer-nav .q-btn {
  width: 40px;
  height: 40px;
  color: #5c6b78;
}

.footer-nav .q-btn:disabled {
  color: #c8cfd5;
}

.page-counter {
  padding: 0 8px;
  color: #6f8087;
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.page-counter strong {
  color: #2b3a4a;
  font-weight: var(--fw-bold);
}

/* =========================================================
   CONFIRMATION DIALOG (start review)
   Same look as the dialogs on My Nominations.
   Mobile: stacked full-width buttons, confirm on top.
========================================================= */
.confirmation-dialog {
  width: min(390px, 92vw);
  max-width: 92vw;
  padding: 24px 20px 18px;
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

.confirmation-icon.is-warning {
  color: #d4880f;
  background: #fef6ea;
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
  overflow-wrap: anywhere;
}

.confirmation-message strong {
  color: #405967;
  font-weight: var(--fw-semibold);
}

.confirmation-note {
  display: block;
  margin-top: 6px;
  color: #8a95a0;
  font-size: var(--fs-sm);
}

.confirmation-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  margin-top: 22px;
}

.confirmation-actions .q-btn {
  width: 100%;
}

.dialog-cancel-btn {
  min-height: 44px;
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

.dialog-confirm-btn {
  min-height: 44px;
  padding: 0 18px;
  color: #ffffff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.dialog-confirm-btn.is-primary {
  background: linear-gradient(135deg, #f5a623, #e8911a);
}

/* =========================================================
   >= 600px  (large phones / small tablets)
========================================================= */
@media (min-width: 600px) {
  .filter-section {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    padding: 13px 16px;
  }

  .filter-search {
    grid-column: 1 / -1;
  }

  .filter-select--wide {
    grid-column: auto;
  }

  .clear-btn {
    grid-column: auto;
    justify-self: end;
  }

  .nominations-table :deep(.nomination-cards) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .footer-summary {
    text-align: left;
  }

  .table-footer {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
  }

  .confirmation-dialog {
    padding: 28px 25px 22px;
  }

  .confirmation-actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .confirmation-actions .q-btn {
    width: auto;
  }

  .dialog-cancel-btn,
  .dialog-confirm-btn {
    min-height: 36px;
  }
}

/* =========================================================
   >= 800px  (tablet landscape): header + filters on one row
========================================================= */
@media (min-width: 800px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .header-btn {
    flex-shrink: 0;
    min-height: 36px;
  }

  .filter-section {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 13px 20px;
  }

  .filter-search {
    flex: 1 1 260px;
    max-width: 340px;
  }

  .filter-select {
    flex: 0 0 160px;
    width: 160px;
  }

  .filter-select--wide {
    flex: 0 0 200px;
    width: 200px;
  }

  .clear-btn {
    justify-self: auto;
  }

  .filter-search :deep(.q-field__control),
  .filter-select :deep(.q-field__control) {
    min-height: 38px;
  }
}

/* =========================================================
   >= 1024px  (desktop): real table replaces cards
========================================================= */
@media (min-width: 1024px) {
  .footer-nav .q-btn {
    width: auto;
    height: auto;
  }
}

/* =========================================================
   >= 1440px  (large monitors)
========================================================= */
@media (min-width: 1440px) {
  .module-page {
    max-width: 1600px;
    margin-inline: auto;
  }
}

/* =========================================================
   Hover only where a real pointer exists (not on touch)
========================================================= */
@media (hover: hover) and (pointer: fine) {
  .nominations-table :deep(tbody tr:hover) {
    background: #fefaf5;
  }

  .nomination-card:hover {
    border-color: #f0c98f;
    box-shadow: 0 4px 14px rgba(232, 145, 26, 0.12);
  }

  .header-btn--secondary:hover {
    border-color: #c2cad0;
    background: #f7f8f9;
  }

  .act-btn--neutral:hover {
    background: #e6ecea;
  }

  .act-btn--accent:hover {
    background: #fdebd0;
  }

  .act-btn--danger:hover {
    background: #f7d4d4;
  }
}

/* =========================================================
   Accessibility
========================================================= */
@media (prefers-reduced-motion: reduce) {
  .nominations-table :deep(tbody tr),
  .nomination-card,
  .act-btn {
    transition: none;
  }
}
</style>
