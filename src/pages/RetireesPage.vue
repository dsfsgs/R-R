<template>
  <q-page class="module-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="page-header-text">
        <h6 class="page-title">Retiree Employee</h6>
        <p class="page-subtitle">List of Potential Retirees</p>
      </div>

      <q-btn
        unelevated
        no-caps
        icon="refresh"
        label="Refresh"
        class="header-btn header-btn--secondary"
        :loading="store.loading"
        @click="reload"
      />
    </section>

    <!-- TABLE CARD -->
    <q-card flat class="loyalty-card">
      <!-- FILTERS -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by name, designation or control no..."
          class="filter-search"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="filterStatus"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Status"
          :options="statusOptions"
          options-dense
          class="filter-select"
        />

        <q-input
          v-model="asOfDate"
          outlined
          dense
          type="date"
          label="As Of Date"
          class="filter-select filter-select--narrow"
        >
          <template #prepend>
            <q-icon name="event" size="16px" />
          </template>
        </q-input>

        <!-- AGE FILTER -->
        <div class="filter-age-group">
          <span class="filter-age-label">Age</span>

          <q-btn-toggle
            v-model="ageMode"
            no-caps
            unelevated
            dense
            toggle-color="blue-grey-9"
            color="grey-3"
            text-color="blue-grey-8"
            :options="AGE_MODE_OPTIONS"
            class="filter-age-mode-toggle"
          />

          <!-- EXACT -->
          <q-input
            v-if="ageMode === 'exact'"
            v-model.number="ageExact"
            outlined
            dense
            clearable
            type="number"
            min="0"
            step="1"
            placeholder="Enter age"
            class="filter-age-input"
          >
            <template #prepend>
              <q-icon name="person" size="16px" />
            </template>
          </q-input>

          <!-- RANGE -->
          <template v-else>
            <q-input
              v-model.number="ageMin"
              outlined
              dense
              clearable
              type="number"
              min="0"
              step="1"
              placeholder="Min"
              class="filter-age-input filter-age-input--small"
            />
            <span class="filter-age-dash">–</span>
            <q-input
              v-model.number="ageMax"
              outlined
              dense
              clearable
              type="number"
              min="0"
              step="1"
              placeholder="Max"
              class="filter-age-input filter-age-input--small"
            />
          </template>
        </div>

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

      <!-- TABLE (desktop) / CARDS (compact) -->
      <div class="table-wrapper">
        <q-table
          flat
          :grid="isCompact"
          :rows="filteredRows"
          :columns="columns"
          :visible-columns="visibleColumns"
          row-key="ControlNo"
          :loading="store.loading"
          class="loyalty-table"
          card-container-class="loyalty-cards"
          v-model:pagination="pagination"
          :rows-per-page-options="[5, 10, 25, 50, 100]"
          hide-header-on-grid
          wrap-cells
        >
          <!-- DESKTOP CELLS -->
          <template #body-cell-no="props">
            <q-td :props="props" class="cell-no">
              {{ rowNumber(props.rowIndex) }}
            </q-td>
          </template>

          <template #body-cell-employee="props">
            <q-td :props="props">
              <div class="cell-title">{{ props.row.EmployeeName || "—" }}</div>
              <div class="cell-sub">{{ props.row.ControlNo || "" }}</div>
            </q-td>
          </template>

          <template #body-cell-designation="props">
            <q-td :props="props">
              <div class="cell-designation">
                {{ props.row.Designation || "—" }}
              </div>
            </q-td>
          </template>

          <template #body-cell-office="props">
            <q-td :props="props">
              <div class="cell-office">{{ props.row.Office || "—" }}</div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                v-if="props.row.Status"
                class="status-badge"
                :class="statusClass(props.row.Status)"
              >
                {{ statusLabel(props.row.Status) }}
              </span>
              <span v-else class="milestone-none">—</span>
            </q-td>
          </template>

          <template #body-cell-age="props">
            <q-td :props="props">
              <div class="cell-years">
                {{
                  ageFor(props.row) != null ? `${ageFor(props.row)} yrs` : "—"
                }}
              </div>
            </q-td>
          </template>

          <template #body-cell-total_years="props">
            <q-td :props="props">
              <div class="cell-years">
                {{ props.row.TotalYearsOfService || "—" }}
              </div>
            </q-td>
          </template>

          <template #body-cell-loyalty="props">
            <q-td :props="props">
              <template v-if="displayLoyalty(props.row) !== '—'">
                <div class="cell-years">
                  {{ displayLoyalty(props.row) }}
                </div>
                <div v-if="props.row.LoyaltyServiceStartDate" class="cell-date">
                  <q-icon name="event" size="11px" />
                  Since {{ formatDate(props.row.LoyaltyServiceStartDate) }}
                </div>
              </template>
              <span v-else class="milestone-none">—</span>
            </q-td>
          </template>

          <template #body-cell-honorees="props">
            <q-td :props="props">
              <template v-if="displayHonorees(props.row) !== '—'">
                <div class="cell-years">
                  {{ displayHonorees(props.row) }}
                </div>
                <div
                  v-if="props.row.HonoreesServiceStartDate"
                  class="cell-date"
                >
                  <q-icon name="event" size="11px" />
                  Since {{ formatDate(props.row.HonoreesServiceStartDate) }}
                </div>
              </template>
              <span v-else class="milestone-none">—</span>
            </q-td>
          </template>

          <!-- ACTIONS: service record only -->
          <template #body-cell-actions="props">
            <q-td :props="props" class="cell-actions">
              <div class="row-actions">
                <q-btn
                  unelevated
                  no-caps
                  dense
                  icon="history_edu"
                  class="act-btn act-btn--neutral act-btn--icon"
                  aria-label="View service record"
                  @click.stop="viewServiceRecord(props.row)"
                >
                  <q-tooltip anchor="top middle" self="bottom middle">
                    Service record
                  </q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- COMPACT CARD -->
          <template #item="props">
            <article class="loyalty-card-item">
              <header class="card-top">
                <div class="card-nominee">
                  <span class="card-index">
                    {{ rowNumber(props.rowIndex) }}
                  </span>
                  <span class="card-name">
                    {{ props.row.EmployeeName || "—" }}
                  </span>
                </div>

                <span
                  v-if="props.row.Status"
                  class="status-badge"
                  :class="statusClass(props.row.Status)"
                >
                  {{ statusLabel(props.row.Status) }}
                </span>
              </header>

              <div class="card-designation">
                {{ props.row.Designation || "—" }}
              </div>

              <div v-if="props.row.Office" class="card-office">
                <q-icon name="business" size="13px" />
                <span>{{ props.row.Office }}</span>
              </div>

              <dl class="card-fields">
                <div class="card-field">
                  <dt>Age</dt>
                  <dd class="card-years">
                    {{
                      ageFor(props.row) != null
                        ? `${ageFor(props.row)} yrs`
                        : "—"
                    }}
                  </dd>
                </div>
                <div class="card-field">
                  <dt>Total Service</dt>
                  <dd class="card-years">
                    {{ props.row.TotalYearsOfService || "—" }}
                  </dd>
                </div>
                <div class="card-field">
                  <dt>Loyalty Service</dt>
                  <dd>
                    {{ displayLoyalty(props.row) }}
                    <div
                      v-if="
                        displayLoyalty(props.row) !== '—' &&
                        props.row.LoyaltyServiceStartDate
                      "
                      class="card-sub"
                    >
                      Since {{ formatDate(props.row.LoyaltyServiceStartDate) }}
                    </div>
                  </dd>
                </div>
                <div class="card-field">
                  <dt>Honorees Service</dt>
                  <dd>
                    {{ displayHonorees(props.row) }}
                    <div
                      v-if="
                        displayHonorees(props.row) !== '—' &&
                        props.row.HonoreesServiceStartDate
                      "
                      class="card-sub"
                    >
                      Since
                      {{ formatDate(props.row.HonoreesServiceStartDate) }}
                    </div>
                  </dd>
                </div>
              </dl>

              <footer class="card-actions">
                <q-btn
                  unelevated
                  no-caps
                  dense
                  icon="history_edu"
                  label="Service Record"
                  class="act-btn act-btn--neutral"
                  @click.stop="viewServiceRecord(props.row)"
                />
              </footer>
            </article>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="inbox" size="34px" />
              <div>
                {{
                  store.loaded && !store.loading
                    ? hasAnyFilter
                      ? "No employees match the current filters."
                      : "No potential retirees found."
                    : "Loading retiree data…"
                }}
              </div>
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
                employees
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

    <!-- SERVICE RECORD MODAL -->
    <ServiceRecordDialog
      v-model="showServiceRecord"
      :control-no="serviceRecordControlNo"
      :employee-name="serviceRecordEmployeeName"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { usePotentialRetireesStore } from "src/stores/potentialRetireesStore";
import ServiceRecordDialog from "src/components/ServiceRecordDialog.vue";

/* =========================================================
   CONSTANTS
========================================================= */
const LOYALTY_THRESHOLD_YEARS = 15;

const AGE_MODE_OPTIONS = [
  { label: "Exact", value: "exact" },
  { label: "Range", value: "range" },
];

const COLUMNS = [
  {
    name: "no",
    label: "NO.",
    field: "no",
    align: "left",
    style: "width: 56px",
    hideBelow: "lg",
  },
  {
    name: "employee",
    label: "EMPLOYEE",
    field: "EmployeeName",
    align: "left",
    style: "width: 200px",
  },
  {
    name: "designation",
    label: "DESIGNATION",
    field: "Designation",
    align: "left",
    style: "width: 180px",
  },
  {
    name: "office",
    label: "OFFICE",
    field: "Office",
    align: "left",
    style: "width: 220px",
    hideBelow: "md",
  },
  {
    name: "status",
    label: "STATUS",
    field: "Status",
    align: "left",
    style: "width: 120px",
    hideBelow: "lg",
  },
  {
    name: "age",
    label: "AGE",
    field: "Age",
    align: "left",
    style: "width: 90px",
  },
  {
    name: "total_years",
    label: "TOTAL SERVICE",
    field: "TotalYearsOfService",
    align: "left",
    style: "width: 160px",
  },
  {
    name: "loyalty",
    label: "LOYALTY SERVICE",
    field: "LoyaltyService",
    align: "left",
    style: "width: 180px",
  },
  {
    name: "honorees",
    label: "HONOREES SERVICE",
    field: "HonoreesService",
    align: "left",
    style: "width: 180px",
  },
  {
    name: "actions",
    label: "ACTIONS",
    field: "actions",
    align: "left",
    style: "width: 90px; min-width: 90px",
    headerStyle: "width: 90px; min-width: 90px",
  },
];

const RPP_OPTIONS = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const STATUS_LABELS = {
  REGULAR: "Permanent",
  PERMANENT: "Permanent",
  HONORARIUM: "Honorarium",
  CONTRACTUAL: "Contractual",
  CASUAL: "Casual",
  "CO-TERMINUS": "Co-Terminus",
  CO_TERMINUS: "Co-Terminus",
  COTERMINUS: "Co-Terminus",
  ELECTIVE: "Elective",
  TEMPORARY: "Temporary",
};

/* =========================================================
   HELPERS
========================================================= */

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function asDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function calcAge(birthDate, asOf) {
  const dob = asDate(birthDate);
  const ref = asDate(asOf);
  if (!dob || !ref) return null;

  let age = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function calcYearsDecimal(startDate, asOf) {
  const start = asDate(startDate);
  const ref = asDate(asOf);
  if (!start || !ref) return null;

  const ms = ref.getTime() - start.getTime();
  if (ms < 0) return 0;
  return ms / (365.25 * 24 * 60 * 60 * 1000);
}

function formatServiceYears(years) {
  if (years == null) return null;
  const y = Math.floor(years);
  const m = Math.floor((years - y) * 12);
  return `${y} year${y === 1 ? "" : "s"} ${m} month${m === 1 ? "" : "s"}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status) {
  if (!status) return "—";
  const key = String(status).trim().toUpperCase();
  if (STATUS_LABELS[key]) return STATUS_LABELS[key];
  const lower = key.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function isSetNumber(v) {
  return v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));
}

export default defineComponent({
  name: "PotentialRetireesPage",

  components: { ServiceRecordDialog },

  setup() {
    const $q = useQuasar();
    const store = usePotentialRetireesStore();

    /* =========================================================
       STATE
    ========================================================= */
    const search = ref("");
    const filterStatus = ref(null);

    /** Reference date for computed age + service durations. */
    const asOfDate = ref(todayISO());

    /**
     * Age filter mode:
     *   "exact" → single input (ageExact)
     *   "range" → two inputs (ageMin – ageMax)
     */
    const ageMode = ref("exact");
    const ageExact = ref(null);
    const ageMin = ref(null);
    const ageMax = ref(null);

    const pagination = ref({
      page: 1,
      rowsPerPage: 5,
      sortBy: null,
      descending: false,
    });

    const showServiceRecord = ref(false);
    const serviceRecordControlNo = ref(null);
    const serviceRecordEmployeeName = ref("");

    /* =========================================================
       COMPUTED — responsive
    ========================================================= */
    const isCompact = computed(() => $q.screen.lt.md);

    const visibleColumns = computed(() =>
      COLUMNS.filter((c) => {
        if (c.hideBelow === "lg" && $q.screen.lt.lg) return false;
        if (c.hideBelow === "xl" && $q.screen.lt.xl) return false;
        return true;
      }).map((c) => c.name)
    );

    /* =========================================================
       COMPUTED — filter option lists
    ========================================================= */
    const statusOptions = computed(() => {
      const set = new Set();
      for (const e of store.employees) {
        if (e.Status) set.add(e.Status);
      }
      return [...set].sort().map((v) => ({ label: statusLabel(v), value: v }));
    });

    /* =========================================================
       COMPUTED — age filter state
    ========================================================= */
    const isAgeFilterActive = computed(() => {
      if (ageMode.value === "exact") return isSetNumber(ageExact.value);
      return isSetNumber(ageMin.value) || isSetNumber(ageMax.value);
    });

    /* =========================================================
       COMPUTED — rows
    ========================================================= */
    const rows = computed(() => {
      const list = store.employees;
      return [...list].sort((a, b) => {
        const ageA = ageFor(a) ?? 0;
        const ageB = ageFor(b) ?? 0;
        return ageB - ageA;
      });
    });

    const hasAnyFilter = computed(
      () =>
        !!search.value?.trim() ||
        !!filterStatus.value ||
        isAgeFilterActive.value
    );

    const filteredRows = computed(() => {
      let result = rows.value;

      const keyword = search.value?.toLowerCase().trim();
      if (keyword) {
        result = result.filter((r) =>
          [r.EmployeeName, r.Designation, r.ControlNo]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(keyword))
        );
      }

      if (filterStatus.value) {
        result = result.filter((r) => r.Status === filterStatus.value);
      }

      if (isAgeFilterActive.value) {
        result = result.filter((r) => {
          const age = ageFor(r);
          if (age == null) return false;

          if (ageMode.value === "exact") {
            return age === Number(ageExact.value);
          }

          const hasMin = isSetNumber(ageMin.value);
          const hasMax = isSetNumber(ageMax.value);
          let lo = hasMin ? Number(ageMin.value) : null;
          let hi = hasMax ? Number(ageMax.value) : null;

          // Swap if user entered them backwards
          if (lo != null && hi != null && lo > hi) {
            [lo, hi] = [hi, lo];
          }

          if (lo != null && age < lo) return false;
          if (hi != null && age > hi) return false;
          return true;
        });
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

    /* =========================================================
       WATCHERS
    ========================================================= */
    watch(
      [search, filterStatus, ageMode, ageExact, ageMin, ageMax, asOfDate],
      () => {
        pagination.value.page = 1;
      }
    );

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

    /* =========================================================
       LIFECYCLE
    ========================================================= */
    onMounted(reload);

    /* =========================================================
       HELPERS — display logic
    ========================================================= */
    function ageFor(row) {
      const computed = calcAge(row?.BirthDate, asOfDate.value);
      if (computed != null) return computed;
      return row?.Age != null ? Number(row.Age) : null;
    }

    function loyaltyYearsFor(row) {
      return calcYearsDecimal(row?.LoyaltyServiceStartDate, asOfDate.value);
    }

    function displayLoyalty(row) {
      const years = loyaltyYearsFor(row);
      if (years == null || years < LOYALTY_THRESHOLD_YEARS) return "—";
      return formatServiceYears(years);
    }

    function displayHonorees(row) {
      const l = loyaltyYearsFor(row);
      if (l != null && l >= LOYALTY_THRESHOLD_YEARS) return "—";

      const h = calcYearsDecimal(row?.HonoreesServiceStartDate, asOfDate.value);
      if (h == null) return "—";
      return formatServiceYears(h);
    }

    /* =========================================================
       HELPERS — misc
    ========================================================= */
    function notify(message, type = "positive") {
      $q.notify({ type, message, position: "top" });
    }

    async function reload() {
      const res = await store.fetch();
      if (!res.success) notify(res.message, "negative");
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

    function clearFilters() {
      search.value = "";
      filterStatus.value = null;
      ageMode.value = "exact";
      ageExact.value = null;
      ageMin.value = null;
      ageMax.value = null;
      asOfDate.value = todayISO();
    }

    function statusClass(status) {
      if (!status) return "status-default";
      const s = String(status).toLowerCase();
      if (s === "regular" || s === "permanent") return "status-regular";
      if (
        s === "honorarium" ||
        s === "contractual" ||
        s === "casual" ||
        s === "co-terminus" ||
        s === "co_terminus" ||
        s === "coterminus" ||
        s === "temporary"
      ) {
        return "status-temporary";
      }
      if (s === "elective") return "status-elective";
      return "status-default";
    }

    function viewServiceRecord(row) {
      if (!row?.ControlNo) {
        notify("This employee has no control number on file.", "warning");
        return;
      }
      serviceRecordControlNo.value = row.ControlNo;
      serviceRecordEmployeeName.value = row.EmployeeName || "";
      showServiceRecord.value = true;
    }

    return {
      // stores / config
      store,
      columns: COLUMNS,
      rppOptions: RPP_OPTIONS,
      AGE_MODE_OPTIONS,

      // state
      search,
      filterStatus,
      asOfDate,
      ageMode,
      ageExact,
      ageMin,
      ageMax,
      pagination,
      isCompact,
      visibleColumns,
      filteredRows,
      rangeStart,
      rangeEnd,
      hasAnyFilter,
      statusOptions,

      // service-record dialog
      showServiceRecord,
      serviceRecordControlNo,
      serviceRecordEmployeeName,

      // helpers
      rowNumber,
      goToPage,
      clearFilters,
      statusClass,
      statusLabel,
      formatDate,
      ageFor,
      displayLoyalty,
      displayHonorees,

      // actions
      reload,
      viewServiceRecord,
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
  padding: clamp(12px, 2.5vw, 20px);
  padding-left: max(clamp(12px, 2.5vw, 20px), env(safe-area-inset-left));
  padding-right: max(clamp(12px, 2.5vw, 20px), env(safe-area-inset-right));
  padding-bottom: max(clamp(12px, 2.5vw, 20px), env(safe-area-inset-bottom));
  color: #19354a;
  overflow-x: clip;
}

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
.loyalty-card {
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   FILTERS
========================================================= */
.filter-section {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.filter-search,
.filter-select {
  min-width: 0;
}

/* Age filter group */
.filter-age-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  grid-column: 1 / -1;
}

.filter-age-label {
  flex-shrink: 0;
  color: #6f8087;
  font-size: var(--fs-sm);
  font-weight: 600;
  letter-spacing: 0.2px;
}

.filter-age-mode-toggle {
  flex-shrink: 0;
  border: 1px solid #dde3e8;
  border-radius: 6px;
  overflow: hidden;
}

.filter-age-mode-toggle :deep(.q-btn) {
  min-height: 36px;
  padding: 0 14px;
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;
}

.filter-age-mode-toggle :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.filter-age-input {
  min-width: 140px;
  flex: 1 1 140px;
  max-width: 200px;
}

.filter-age-input--small {
  min-width: 90px;
  flex: 1 1 90px;
  max-width: 120px;
}

.filter-age-input :deep(.q-field__control) {
  min-height: 36px;
}

.filter-age-input :deep(.q-field__native) {
  font-size: 16px;
  text-align: left;
}

.filter-age-dash {
  flex-shrink: 0;
  color: #97a1a9;
  font-weight: 600;
}

.clear-btn {
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

.loyalty-table {
  box-shadow: none;
  background: transparent;
}

.loyalty-table :deep(th) {
  height: 48px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  border-bottom: 1px solid #edf1ef;
}

.loyalty-table :deep(td) {
  height: 68px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--fs-base);
  vertical-align: middle;
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
}

.cell-sub {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-xs);
  letter-spacing: 0.2px;
}

.cell-designation {
  color: #5c6b78;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-office {
  color: #5c6b78;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-years {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  white-space: nowrap;
}

.cell-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-xs);
  white-space: nowrap;
}

.cell-date .q-icon {
  color: #b3bcc4;
  flex-shrink: 0;
}

.milestone-none {
  color: #c8cfd5;
}

/* =========================================================
   STATUS BADGES
========================================================= */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-regular {
  color: #0c9145;
  background: #e1f7e6;
}
.status-temporary {
  color: #b46e0a;
  background: #fef6ea;
}
.status-elective {
  color: #7a4fb8;
  background: #f1eafa;
}
.status-default {
  color: #5c6b78;
  background: #eef1f4;
}

/* =========================================================
   ROW ACTIONS
========================================================= */
.cell-actions {
  white-space: nowrap;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.act-btn {
  flex-shrink: 0;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  text-transform: none;
  white-space: nowrap;
  transition: background 0.12s ease, color 0.12s ease;
}

.act-btn :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.act-btn--neutral {
  color: #52646f;
  background: #f3f6f5;
}

.act-btn--icon {
  min-width: 32px;
  padding: 0;
}

/* =========================================================
   CARD LIST (compact)
========================================================= */
.loyalty-table :deep(.loyalty-cards) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  padding: 12px 0;
}

.loyalty-card-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 14px;
  border: 1px solid #edf1ef;
  border-radius: 10px;
  background: #ffffff;
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

.card-designation {
  margin-top: -4px;
  color: #7d8c93;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
  overflow-wrap: anywhere;
}

.card-office {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: -2px;
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

.card-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  margin: 0;
}

.card-field {
  min-width: 0;
}

.card-field dt {
  margin: 0 0 2px;
  color: #7d8c93;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.card-field dd {
  margin: 0;
  color: #425b68;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
  overflow-wrap: anywhere;
}

.card-years {
  color: #19354a;
  font-weight: var(--fw-semibold);
}

.card-sub {
  margin-top: 2px;
  color: #8a95a0;
  font-size: var(--fs-xs);
  font-style: italic;
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
   PAGINATION FOOTER
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
   RESPONSIVE
========================================================= */
@media (min-width: 600px) {
  .filter-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 13px 16px;
  }

  .filter-search {
    flex: 1 1 240px;
    max-width: 360px;
  }

  .filter-select {
    flex: 0 0 180px;
    width: 180px;
  }

  .filter-select--narrow {
    flex: 0 0 160px;
    width: 160px;
  }

  .filter-age-group {
    flex: 1 1 auto;
    grid-column: auto;
    min-width: 320px;
  }

  .loyalty-table :deep(.loyalty-cards) {
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
}

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
    padding: 13px 20px;
  }

  .filter-search :deep(.q-field__control),
  .filter-select :deep(.q-field__control) {
    min-height: 38px;
  }
}

@media (min-width: 1024px) {
  .loyalty-table {
    min-width: 1300px;
  }

  .footer-nav .q-btn {
    width: auto;
    height: auto;
  }
}

@media (min-width: 1440px) {
  .module-page {
    max-width: 1600px;
    margin-inline: auto;
  }
}

/* =========================================================
   Hover
========================================================= */
@media (hover: hover) and (pointer: fine) {
  .loyalty-table :deep(tbody tr:hover) {
    background: #fefaf5;
  }

  .act-btn--neutral:hover {
    background: #e6ecea;
  }

  .header-btn--secondary:hover {
    border-color: #c2cad0;
    background: #f7f8f9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .act-btn {
    transition: none;
  }
}
</style>
