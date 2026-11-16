<template>
  <q-dialog
    v-model="open"
    persistent
    :maximized="isMobile"
    :transition-show="isMobile ? 'slide-up' : 'scale'"
    :transition-hide="isMobile ? 'slide-down' : 'scale'"
  >
    <q-card
      flat
      class="service-record-dialog"
      :class="{ 'service-record-dialog--desktop': !isMobile }"
    >
      <!-- HEADER -->
      <header class="dialog-header">
        <div class="dialog-header-text">
          <div class="dialog-eyebrow">Service Record</div>
          <div class="dialog-title">{{ employeeName || "Employee" }}</div>
          <div v-if="controlNo" class="dialog-control-no">
            Control No. <span>{{ controlNo }}</span>
          </div>
        </div>

        <div class="dialog-header-actions">
          <q-btn
            flat
            round
            dense
            icon="refresh"
            aria-label="Refresh service record"
            class="header-icon-btn"
            :disable="loading"
            @click="reload"
          >
            <q-tooltip>Refresh</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Close"
            class="header-icon-btn"
            v-close-popup
          />
        </div>
      </header>

      <!-- FILTER BAR -->
      <div v-if="!loading && !error && rows.length > 0" class="filter-bar">
        <q-btn-toggle
          v-model="recordFilter"
          unelevated
          no-caps
          dense
          :spread="isMobile"
          color="white"
          text-color="grey-8"
          toggle-color="primary"
          toggle-text-color="white"
          class="filter-toggle"
          :options="filterOptions"
        />

        <div v-if="scopeNote" class="filter-note">
          <q-icon name="event" size="12px" />
          <span>{{ scopeNote }}</span>
        </div>
      </div>

      <!-- BODY -->
      <div class="dialog-body">
        <!-- Loading -->
        <div v-if="loading" class="state-block">
          <q-spinner color="primary" size="32px" />
          <div class="state-text">Loading service record…</div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state-block">
          <q-icon name="error_outline" size="34px" color="negative" />
          <div class="state-text">{{ error }}</div>
          <q-btn
            unelevated
            no-caps
            icon="refresh"
            label="Try again"
            class="retry-btn"
            @click="reload"
          />
        </div>

        <!-- Empty -->
        <div v-else-if="rows.length === 0" class="state-block">
          <q-icon name="folder_off" size="34px" class="empty-icon" />
          <div class="state-text">No service records on file.</div>
        </div>

        <!-- Empty after filter -->
        <div v-else-if="filteredRows.length === 0" class="state-block">
          <q-icon name="filter_alt_off" size="34px" class="empty-icon" />
          <div class="state-text">No records match this filter.</div>
        </div>

        <!-- Table (desktop) / Cards (compact) -->
        <div v-else class="service-table-wrapper">
          <q-table
            flat
            dense
            :grid="isCompact"
            :rows="filteredRows"
            :columns="columns"
            row-key="__key"
            :rows-per-page-options="[0]"
            hide-pagination
            hide-header-on-grid
            wrap-cells
            class="service-table"
            card-container-class="service-cards"
          >
            <!-- DESKTOP CELLS (From, To, Designation, Status, Grade, Step, Office, Duration) -->
            <template #body-cell-from="props">
              <q-td :props="props">
                <span class="cell-date">{{
                  formatDate(props.row.FromDate)
                }}</span>
              </q-td>
            </template>

            <template #body-cell-to="props">
              <q-td :props="props">
                <span
                  class="cell-date"
                  :class="{ 'is-current': !props.row.ToDate }"
                >
                  {{
                    props.row.ToDate ? formatDate(props.row.ToDate) : "Present"
                  }}
                </span>
              </q-td>
            </template>

            <template #body-cell-designation="props">
              <q-td :props="props">
                <div class="cell-primary">
                  {{ props.row.Designation || "—" }}
                </div>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <span
                  v-if="props.row.Status"
                  class="status-badge"
                  :class="statusClass(props.row.Status)"
                >
                  {{ displayStatus(props.row.Status) }}
                </span>
                <span v-else class="cell-none">—</span>
              </q-td>
            </template>

            <template #body-cell-grade="props">
              <q-td :props="props" class="cell-grade">
                {{ props.row.Grade ?? "—" }}
              </q-td>
            </template>

            <template #body-cell-steps="props">
              <q-td :props="props" class="cell-grade">
                {{ props.row.Steps ?? "—" }}
              </q-td>
            </template>

            <template #body-cell-office="props">
              <q-td :props="props">
                <div class="cell-office">{{ props.row.Office || "—" }}</div>
              </q-td>
            </template>

            <template #body-cell-duration="props">
              <q-td :props="props">
                <span class="cell-duration">{{ props.row.__duration }}</span>
              </q-td>
            </template>

            <!-- COMPACT CARD -->
            <template #item="props">
              <article class="record-item">
                <header class="record-top">
                  <div class="record-period">
                    <q-icon name="event" size="13px" />
                    <span>{{ formatDate(props.row.FromDate) }}</span>
                    <span class="record-period-sep">→</span>
                    <span :class="{ 'is-current': !props.row.ToDate }">
                      {{
                        props.row.ToDate
                          ? formatDate(props.row.ToDate)
                          : "Present"
                      }}
                    </span>
                  </div>

                  <span
                    v-if="props.row.Status"
                    class="status-badge"
                    :class="statusClass(props.row.Status)"
                  >
                    {{ displayStatus(props.row.Status) }}
                  </span>
                </header>

                <div class="record-designation">
                  {{ props.row.Designation || "—" }}
                </div>

                <div v-if="props.row.Office" class="record-office">
                  <q-icon name="business" size="12px" />
                  <span>{{ props.row.Office }}</span>
                </div>

                <dl class="record-fields">
                  <div class="record-field record-field--full">
                    <dt>Duration</dt>
                    <dd>{{ props.row.__duration }}</dd>
                  </div>
                  <div class="record-field">
                    <dt>Grade</dt>
                    <dd>{{ props.row.Grade ?? "—" }}</dd>
                  </div>
                  <div class="record-field">
                    <dt>Step</dt>
                    <dd>{{ props.row.Steps ?? "—" }}</dd>
                  </div>
                </dl>
              </article>
            </template>
          </q-table>
        </div>
      </div>

      <!-- FOOTER -->
      <footer class="dialog-actions">
        <div class="dialog-footer-meta">
          <template v-if="!loading && !error">
            <span class="footer-count">{{ footerCount }}</span>

            <span v-if="footerTotal" class="footer-total">
              <q-icon name="schedule" size="13px" />
              <span class="footer-total-label">Total</span>
              <strong class="footer-total-value">{{ footerTotal }}</strong>
            </span>
          </template>
        </div>

        <q-btn flat no-caps label="Close" class="close-btn" v-close-popup />
      </footer>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useLoyaltyStore } from "src/stores/loyaltyStore";

/* =========================================================
   CONSTANTS
========================================================= */

/* Same statuses the SQL view counts as Loyalty service */
const LOYALTY_STATUSES = [
  "REGULAR",
  "CASUAL",
  "CO-TERMINOUS",
  "ELECTIVE",
  "TEMPORARY",
];

/* A gap of more than this many days starts a new continuous period */
const MAX_GAP_DAYS = 6;

/* AP-style month abbreviations: Aug. 15, 2024 */
const MONTHS = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Loyalty Service", value: "loyalty" },
  { label: "Honorees Service", value: "honorees" },
];

/* =========================================================
   HELPERS
========================================================= */

/* Parse a date value safely. ISO dates are built as local dates
   so the day never shifts because of timezones. Returns Date | null. */
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/* Whole days between two dates (DST-safe) */
function dayDiff(a, b) {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / 86400000);
}

/* Date -> "Aug. 15, 2024". Falls back to the raw text if unreadable. */
function formatDate(value) {
  if (!value) return "—";
  const d = parseDate(value);
  if (!d) return String(value);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* Date string -> timestamp. Missing / invalid dates become 0 (oldest). */
function toTime(value) {
  const d = parseDate(value);
  return d ? d.getTime() : 0;
}

/* Latest -> oldest. Same start date: ongoing first, then later end date. */
function sortLatestFirst(list) {
  return [...list].sort((a, b) => {
    const fromDiff = toTime(b.FromDate) - toTime(a.FromDate);
    if (fromDiff !== 0) return fromDiff;

    const aEnd = a.ToDate ? toTime(a.ToDate) : Number.POSITIVE_INFINITY;
    const bEnd = b.ToDate ? toTime(b.ToDate) : Number.POSITIVE_INFINITY;
    if (aEnd === bEnd) return 0;
    return bEnd > aEnd ? 1 : -1;
  });
}

/* "1 year and 6 months" from whole years / months */
function formatYearsMonths(years, months) {
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);

  if (parts.length === 0) return "Less than a month";
  return parts.join(" and ");
}

/* Duration between two dates as "1 year and 6 months".
   The end date counts as a service day (inclusive).
   No ToDate = ongoing, counted up to today. */
function computeDuration(from, to) {
  const start = parseDate(from);
  if (!start) return "—";

  const rawEnd = to ? parseDate(to) : new Date();
  if (!rawEnd) return "—";

  /* Inclusive end: Jan 1 -> Dec 31 should be a full year */
  const end = new Date(
    rawEnd.getFullYear(),
    rawEnd.getMonth(),
    rawEnd.getDate() + 1
  );
  if (end < start) return "—";

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) totalMonths -= 1;
  if (totalMonths < 0) totalMonths = 0;

  return formatYearsMonths(Math.floor(totalMonths / 12), totalMonths % 12);
}

/* Total service days -> "X years and Y months".
   Same rule as the SQL view: years = days / 365, months = (days % 365) / 30,
   so totals match LoyaltyPage. */
function formatServiceDays(days) {
  if (!days || days <= 0) return "—";
  return formatYearsMonths(
    Math.floor(days / 365),
    Math.floor((days % 365) / 30)
  );
}

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

/* Label shown to the user. "Regular" is displayed as "Permanent".
   Display only: filters and totals still use the original status. */
function displayStatus(status) {
  if (!status) return "—";
  if (normalizeStatus(status) === "REGULAR") return "Permanent";
  return status;
}

/* Service periods the SQL view would count:
   - end dates are capped at Dec 31 of the current year
   - records starting after that date are ignored
   - an ongoing record (no ToDate) ends Dec 31 of the current year
   - qualifyingOnly keeps Loyalty statuses only */
function collectPeriods(list, qualifyingOnly) {
  const yearEnd = new Date(new Date().getFullYear(), 11, 31);
  const items = [];

  for (const r of list) {
    if (
      qualifyingOnly &&
      !LOYALTY_STATUSES.includes(normalizeStatus(r.Status))
    ) {
      continue;
    }

    const start = parseDate(r.FromDate);
    if (!start || start > yearEnd) continue;

    let end = r.ToDate ? parseDate(r.ToDate) : yearEnd;
    if (!end) continue;
    if (end > yearEnd) end = yearEnd;
    if (end < start) continue;

    items.push({
      key: r.__key,
      start,
      end,
      days: dayDiff(start, end) + 1,
    });
  }

  return items;
}

/* All statuses: sum of every service day (TotalYearsOfService in the view) */
function getAllTotalDays(list) {
  return collectPeriods(list, false).reduce((sum, it) => sum + it.days, 0);
}

/* Mirrors the SQL view (vwEmployeeYearsOfService):
   - a gap of more than 6 days starts a new continuous period
   - the latest continuous period (latest end, then latest start) is the one that counts
   - Loyalty = qualifying statuses only, Honorees = all statuses
   Returns { keys: Set of row __key, start: Date | null, days: number }. */
function getLatestContinuousScope(list, qualifyingOnly) {
  const items = collectPeriods(list, qualifyingOnly);

  if (items.length === 0) return { keys: new Set(), start: null, days: 0 };

  items.sort((a, b) => a.start - b.start || a.end - b.end);

  const groups = [];
  let current = null;
  let prevMax = null;

  for (const it of items) {
    const isNewPeriod =
      prevMax === null || it.start > addDays(prevMax, MAX_GAP_DAYS);

    if (isNewPeriod) {
      current = { keys: [], start: it.start, end: it.end, days: 0 };
      groups.push(current);
    }

    current.keys.push(it.key);
    current.days += it.days;
    if (it.end > current.end) current.end = it.end;
    if (prevMax === null || it.end > prevMax) prevMax = it.end;
  }

  /* Latest period: latest end date, then latest start date */
  groups.sort((a, b) => b.end - a.end || b.start - a.start);
  const latest = groups[0];

  return {
    keys: new Set(latest.keys),
    start: latest.start,
    days: latest.days,
  };
}

export default defineComponent({
  name: "ServiceRecordDialog",

  props: {
    modelValue: { type: Boolean, default: false },
    controlNo: { type: [String, Number], default: null },
    employeeName: { type: String, default: "" },
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    const $q = useQuasar();
    const store = useLoyaltyStore();

    const open = computed({
      get: () => props.modelValue,
      set: (v) => emit("update:modelValue", v),
    });

    /* Responsive */
    const isMobile = computed(() => $q.screen.lt.sm);
    const isCompact = computed(() => $q.screen.lt.md);

    /* Local state — component owns the lifecycle */
    const rows = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const recordFilter = ref("all");

    /* Order: From, To, Designation, Status, Grade, Step, Office, Duration */
    const columns = [
      {
        name: "from",
        label: "FROM",
        field: "FromDate",
        align: "left",
        style: "width: 108px",
        headerStyle: "width: 108px",
      },
      {
        name: "to",
        label: "TO",
        field: "ToDate",
        align: "left",
        style: "width: 108px",
        headerStyle: "width: 108px",
      },
      {
        name: "designation",
        label: "DESIGNATION",
        field: "Designation",
        align: "left",
      },
      {
        name: "status",
        label: "STATUS",
        field: "Status",
        align: "left",
        style: "width: 104px",
        headerStyle: "width: 104px",
      },
      {
        name: "grade",
        label: "GRADE",
        field: "Grade",
        align: "center",
        style: "width: 52px",
        headerStyle: "width: 52px",
      },
      {
        name: "steps",
        label: "STEP",
        field: "Steps",
        align: "center",
        style: "width: 52px",
        headerStyle: "width: 52px",
      },
      {
        name: "office",
        label: "OFFICE",
        field: "Office",
        align: "left",
      },
      {
        name: "duration",
        label: "DURATION",
        field: "__duration",
        align: "left",
        style: "width: 120px",
        headerStyle: "width: 120px",
      },
    ];

    /* =========================================================
       FILTERING + TOTALS (same rules as the SQL view)
    ========================================================= */
    const loyaltyScope = computed(() =>
      getLatestContinuousScope(rows.value, true)
    );
    const honoreesScope = computed(() =>
      getLatestContinuousScope(rows.value, false)
    );

    /* Total duration per filter (shown in the footer for the active filter) */
    const totals = computed(() => ({
      all: formatServiceDays(getAllTotalDays(rows.value)),
      loyalty: formatServiceDays(loyaltyScope.value.days),
      honorees: formatServiceDays(honoreesScope.value.days),
    }));

    const activeScope = computed(() => {
      if (recordFilter.value === "loyalty") return loyaltyScope.value;
      if (recordFilter.value === "honorees") return honoreesScope.value;
      return null;
    });

    const filteredRows = computed(() => {
      const scope = activeScope.value;
      if (!scope) return rows.value;
      return rows.value.filter((r) => scope.keys.has(r.__key));
    });

    const scopeNote = computed(() => {
      const scope = activeScope.value;
      if (!scope || !scope.start) return "";
      return `Continuous service since ${formatDate(scope.start)}`;
    });

    /* Footer: record count */
    const footerCount = computed(() => {
      const shown = filteredRows.value.length;
      const total = rows.value.length;
      const word = `record${total === 1 ? "" : "s"}`;

      return recordFilter.value === "all"
        ? `${total} ${word}`
        : `${shown} of ${total} ${word}`;
    });

    /* Footer: highlighted total for the active filter ("" hides the chip) */
    const footerTotal = computed(() => {
      const value = totals.value[recordFilter.value];
      return value && value !== "—" ? value : "";
    });

    /* =========================================================
       DATA
    ========================================================= */
    async function load() {
      if (!props.controlNo) return;

      loading.value = true;
      error.value = null;
      rows.value = [];

      const res = await store.fetchServiceRecord(props.controlNo);

      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        /* Latest -> past, then add a stable key and the computed duration */
        rows.value = sortLatestFirst(list).map((r, i) => ({
          ...r,
          __key: i,
          __duration: computeDuration(r.FromDate, r.ToDate),
        }));
      } else {
        error.value = res.message;
      }
      loading.value = false;
    }

    function reload() {
      load();
    }

    function statusClass(status) {
      if (!status) return "status-default";
      const s = String(status).toLowerCase();
      if (s.includes("regular") || s.includes("permanent"))
        return "status-regular";
      if (s.includes("casual")) return "status-casual";
      if (s.includes("contractual")) return "status-contractual";
      if (s.includes("temporary") || s.includes("temp"))
        return "status-temporary";
      if (s.includes("job order") || s.includes("cos")) return "status-cos";
      return "status-default";
    }

    /* Fetch whenever modal opens or the employee changes (filter resets) */
    watch(
      () => [props.modelValue, props.controlNo],
      ([isOpen, controlNo]) => {
        if (isOpen && controlNo) {
          recordFilter.value = "all";
          load();
        }
      },
      { immediate: true }
    );

    return {
      open,
      isMobile,
      isCompact,
      rows,
      filteredRows,
      loading,
      error,
      columns,
      recordFilter,
      filterOptions: FILTER_OPTIONS,
      scopeNote,
      footerCount,
      footerTotal,
      statusClass,
      displayStatus,
      formatDate,
      reload,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   DIALOG SHELL + COMPACT TYPE SCALE
========================================================= */
.service-record-dialog {
  --sr-fs-xs: 10px;
  --sr-fs-sm: 11px;
  --sr-fs-base: 12px;
  --sr-fs-title: 16px;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 100%;
  overflow: hidden;
  background: #ffffff;
  color: #19354a;
  font-size: var(--sr-fs-base);
}

.service-record-dialog--desktop {
  --sr-fs-title: 17px;

  width: min(980px, 96vw);
  max-width: 96vw;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(25, 53, 74, 0.18);
}

/* =========================================================
   HEADER
========================================================= */
.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 14px 16px 12px;
  padding-top: max(14px, env(safe-area-inset-top));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.dialog-header-text {
  min-width: 0;
}

.dialog-eyebrow {
  margin-bottom: 3px;
  color: #8a95a0;
  font-size: var(--sr-fs-xs);
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.dialog-title {
  color: #19354a;
  font-size: var(--sr-fs-title);
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.dialog-control-no {
  margin-top: 3px;
  color: #7a8792;
  font-size: var(--sr-fs-sm);
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
}

.dialog-control-no span {
  color: #2b3a4a;
  font-weight: 600;
}

.dialog-header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
  margin-right: -6px;
}

.header-icon-btn {
  width: 40px;
  height: 40px;
  color: #6f8087;
}

/* =========================================================
   FILTER BAR
========================================================= */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  flex-shrink: 0;
  padding: 10px 16px;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  border-bottom: 1px solid #edf1ef;
  background: #ffffff;
}

.filter-toggle {
  width: 100%;
  border: 1px solid #d6dce1;
  border-radius: 6px;
  overflow: hidden;
}

.filter-toggle :deep(.q-btn) {
  min-height: 36px;
  padding: 0 12px;
  font-size: var(--sr-fs-sm);
  font-weight: 600;
}

.filter-note {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: #7d8c93;
  font-size: var(--sr-fs-sm);
}

.filter-note .q-icon {
  flex-shrink: 0;
  color: #b3bcc4;
}

/* =========================================================
   BODY
========================================================= */
.dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 clamp(8px, 2vw, 14px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;
}

/* States */
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 24px;
  color: #8a989e;
  text-align: center;
}

.state-text {
  max-width: 36ch;
  color: #5c6b78;
  font-size: var(--sr-fs-base);
  line-height: 1.5;
}

.empty-icon {
  color: #c8cfd5;
}

.retry-btn {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #d6dce1;
  border-radius: 6px;
  color: #2b3a4a;
  background: #ffffff;
  font-size: var(--sr-fs-base);
  font-weight: 600;
}

/* =========================================================
   TABLE (desktop)
========================================================= */
.service-table {
  box-shadow: none;
  background: transparent;
}

.service-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 36px;
  padding: 6px 8px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--sr-fs-xs);
  font-weight: 700;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #edf1ef;
}

.service-table :deep(td) {
  height: 46px;
  padding: 6px 8px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--sr-fs-base);
  vertical-align: middle;
}

.cell-date {
  color: #19354a;
  font-size: var(--sr-fs-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cell-duration {
  color: #5c6b78;
  font-size: var(--sr-fs-sm);
  font-weight: 500;
  line-height: 1.4;
  white-space: normal;
}

.is-current {
  color: #0c9145;
  font-weight: 600;
}

.cell-primary {
  color: #19354a;
  font-size: var(--sr-fs-base);
  font-weight: 600;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-office {
  color: #5c6b78;
  font-size: var(--sr-fs-sm);
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-grade {
  color: #5c6b78;
  font-size: var(--sr-fs-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cell-none {
  color: #c8cfd5;
}

/* =========================================================
   CARD LIST (compact)
========================================================= */
.service-table :deep(.service-cards) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  padding: 10px 0;
}

.record-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  padding: 12px;
  border: 1px solid #edf1ef;
  border-radius: 10px;
  background: #ffffff;
}

.record-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.record-period {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
  color: #5c6b78;
  font-size: var(--sr-fs-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.record-period .q-icon {
  color: #b3bcc4;
}

.record-period-sep {
  color: #b3bcc4;
}

.record-designation {
  color: #19354a;
  font-size: var(--sr-fs-base);
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.record-office {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  color: #5c6b78;
  font-size: var(--sr-fs-sm);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.record-office .q-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #97a1a9;
}

.record-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  margin: 3px 0 0;
  padding-top: 9px;
  border-top: 1px solid #edf1ef;
}

.record-field {
  min-width: 0;
}

.record-field--full {
  grid-column: 1 / -1;
}

.record-field dt {
  margin: 0 0 2px;
  color: #7d8c93;
  font-size: var(--sr-fs-xs);
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.record-field dd {
  margin: 0;
  color: #19354a;
  font-size: var(--sr-fs-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* =========================================================
   STATUS BADGES
========================================================= */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 9.5px;
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
.status-casual {
  color: #0c7cb5;
  background: #e6f3fb;
}
.status-contractual {
  color: #d4880f;
  background: #fef6ea;
}
.status-temporary {
  color: #b57400;
  background: #fff4e0;
}
.status-cos {
  color: #7a4a99;
  background: #f3eafa;
}
.status-default {
  color: #5c6b78;
  background: #eef1f4;
}

/* =========================================================
   FOOTER
========================================================= */
.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 8px 16px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  border-top: 1px solid #edf1ef;
  background: #fcfdfc;
}

.dialog-footer-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  min-width: 0;
}

.footer-count {
  color: #7d8c93;
  font-size: var(--sr-fs-sm);
  line-height: 1.4;
}

/* Highlighted total */
.footer-total {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  padding: 4px 10px;
  border: 1px solid #c9dcea;
  border-radius: 6px;
  color: #19354a;
  background: #e8f1f8;
  font-size: var(--sr-fs-sm);
  line-height: 1.3;
}

.footer-total .q-icon {
  flex-shrink: 0;
  color: #3c6f94;
}

.footer-total-label {
  color: #5c7a90;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-size: var(--sr-fs-xs);
}

.footer-total-value {
  color: #19354a;
  font-weight: 700;
  font-size: var(--sr-fs-base);
}

.close-btn {
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  color: #52646f;
  background: #f3f6f5;
  font-size: var(--sr-fs-base);
  font-weight: 600;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (min-width: 600px) {
  .dialog-header {
    padding: 16px 22px 14px;
  }

  .filter-bar {
    padding: 10px 22px;
  }

  .filter-toggle {
    width: auto;
  }

  .filter-toggle :deep(.q-btn) {
    padding: 0 16px;
  }

  .dialog-actions {
    padding: 10px 22px;
  }

  .close-btn {
    min-height: 34px;
  }

  .service-table :deep(.service-cards) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

/* =========================================================
   HOVER
========================================================= */
@media (hover: hover) and (pointer: fine) {
  .service-table :deep(tbody tr:hover) {
    background: #fefaf5;
  }

  .close-btn:hover {
    background: #e6ecea;
  }

  .retry-btn:hover {
    border-color: #c2cad0;
    background: #f7f8f9;
  }

  .header-icon-btn:hover {
    color: #19354a;
  }
}
</style>
