<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-header-text">
        <h6 class="page-title">Customized Rewards and Incentives</h6>
        <p class="page-subtitle">
          Select an award category to review its nominees, rankings and
          incentive status.
        </p>
      </div>
    </section>

    <!-- =====================================================
         MAIN CARD
    ====================================================== -->
    <q-card flat class="incentives-card">
      <!-- ============ CATEGORY SELECTOR ============ -->
      <div class="category-bar">
        <q-select
          v-model="selectedId"
          outlined
          dense
          emit-value
          map-options
          label="Award Category"
          :options="awardOptions"
          class="category-select"
          popup-content-class="category-popup"
          @update:model-value="onCategoryChange"
        >
          <template #prepend>
            <q-icon :name="selectedAward.icon" />
          </template>

          <template #selected-item>
            <span class="selected-label">{{ selectedAward.label }}</span>
          </template>

          <template #option="scope">
            <q-item v-bind="scope.itemProps" class="category-option">
              <q-item-section avatar class="award-avatar">
                <div class="award-icon" :class="`tone-${scope.opt.tone}`">
                  <q-icon :name="scope.opt.icon" size="20px" />
                </div>
              </q-item-section>

              <q-item-section>
                <q-item-label class="award-name">
                  {{ scope.opt.label }}
                </q-item-label>
                <q-item-label caption class="award-caption">
                  {{ scope.opt.caption }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <span class="award-count">{{ scope.opt.count }}</span>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- ============ FILTERS ============ -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by name or office..."
          class="filter-search"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-if="hasStatusColumn"
          v-model="filterStatus"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Status"
          :options="statusOptions"
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

      <!-- ============ TABLE (desktop) / CARDS (compact) ============ -->
      <div class="table-wrapper">
        <q-table
          flat
          :grid="isCompact"
          :rows="filteredRows"
          :columns="columns"
          :visible-columns="visibleColumns"
          row-key="id"
          class="incentives-table"
          card-container-class="incentive-cards"
          v-model:pagination="pagination"
          :rows-per-page-options="[5, 10, 25]"
          hide-header-on-grid
          wrap-cells
        >
          <!-- ============ DESKTOP CELLS ============ -->
          <template #body-cell-no="props">
            <q-td :props="props" class="cell-no">
              {{ rowNumber(props.rowIndex) }}
            </q-td>
          </template>

          <template #body-cell-recipient="props">
            <q-td :props="props">
              <div class="cell-title">{{ props.row.recipient }}</div>
              <div class="cell-sub">{{ props.row.position }}</div>
            </q-td>
          </template>

          <template #body-cell-basis="props">
            <q-td :props="props">
              <div class="cell-details">{{ props.row.basis }}</div>
            </q-td>
          </template>

          <template #body-cell-incentive="props">
            <q-td :props="props">
              <div class="cell-incentive">{{ props.row.incentive }}</div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                v-if="props.row.status"
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
                  unelevated
                  no-caps
                  dense
                  icon="visibility"
                  label="View"
                  class="act-btn act-btn--neutral"
                  @click.stop="viewEntry(props.row)"
                />
                <q-btn
                  unelevated
                  no-caps
                  dense
                  icon="edit"
                  label="Edit"
                  class="act-btn act-btn--accent"
                  @click.stop="editEntry(props.row)"
                />
              </div>
            </q-td>
          </template>

          <!-- ============ COMPACT CARD ============ -->
          <template #item="props">
            <article class="incentive-card">
              <header class="card-top">
                <div class="card-nominee">
                  <span class="card-index">
                    {{ rowNumber(props.rowIndex) }}
                  </span>
                  <span class="card-name">{{ props.row.recipient }}</span>
                </div>

                <span
                  v-if="props.row.status"
                  class="status-badge"
                  :class="STATUS_CLASSES[props.row.status]"
                >
                  {{ STATUS_LABELS[props.row.status] }}
                </span>
              </header>

              <div class="card-position">{{ props.row.position }}</div>

              <dl class="card-fields">
                <div
                  v-for="field in cardFields(props.row)"
                  :key="field.name"
                  class="card-field"
                >
                  <dt>{{ field.label }}</dt>
                  <dd>{{ field.value }}</dd>
                </div>
              </dl>

              <footer class="card-actions">
                <q-btn
                  unelevated
                  no-caps
                  dense
                  icon="visibility"
                  label="View"
                  class="act-btn act-btn--neutral"
                  @click.stop="viewEntry(props.row)"
                />
                <q-btn
                  unelevated
                  no-caps
                  dense
                  icon="edit"
                  label="Edit"
                  class="act-btn act-btn--accent"
                  @click.stop="editEntry(props.row)"
                />
              </footer>
            </article>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="inbox" size="34px" />
              <div>No entries found.</div>
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
                entries
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
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import { useQuasar } from "quasar";

/* =========================================================
   STATUS CONFIG (used by categories that have a status column)
========================================================= */
const STATUS_LABELS = {
  nominated: "Nominated",
  shortlisted: "Shortlisted",
  approved: "Approved",
  awarded: "Awarded",
};

const STATUS_CLASSES = {
  nominated: "status-nominated",
  shortlisted: "status-shortlisted",
  approved: "status-approved",
  awarded: "status-awarded",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const RPP_OPTIONS = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
];

/* =========================================================
   FORMATTERS
========================================================= */
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

/* =========================================================
   COLUMN SETS
   hideBelow: "lg" | "xl"  -> hidden when screen is smaller
========================================================= */
const ACTIONS_COLUMN = {
  name: "actions",
  label: "ACTIONS",
  field: "actions",
  align: "left",
  style: "width: 190px; min-width: 190px",
  headerStyle: "width: 190px; min-width: 190px",
};

const DEFAULT_COLUMNS = [
  {
    name: "no",
    label: "NO.",
    field: "no",
    align: "left",
    style: "width: 56px",
    hideBelow: "lg",
  },
  { name: "recipient", label: "RECIPIENT", field: "recipient", align: "left" },
  { name: "office", label: "OFFICE", field: "office", align: "left" },
  { name: "basis", label: "BASIS", field: "basis", align: "left" },
  {
    name: "period",
    label: "PERIOD",
    field: "period",
    align: "left",
    hideBelow: "lg",
  },
  { name: "incentive", label: "INCENTIVE", field: "incentive", align: "left" },
  { name: "status", label: "STATUS", field: "status", align: "left" },
  ACTIONS_COLUMN,
];

// Section 56 - Service Award/Incentive (Retirement Award)
const SERVICE_COLUMNS = [
  {
    name: "no",
    label: "NO.",
    field: "no",
    align: "left",
    style: "width: 56px",
    hideBelow: "lg",
  },
  { name: "recipient", label: "RETIREE", field: "recipient", align: "left" },
  { name: "office", label: "OFFICE", field: "office", align: "left" },
  {
    name: "years",
    label: "YEARS OF SERVICE",
    field: "years",
    align: "left",
    format: (val) => `${val} years`,
  },
  {
    name: "retirement_date",
    label: "RETIREMENT DATE",
    field: "retirement_date",
    align: "left",
    format: (val) => formatDate(val),
    hideBelow: "lg",
  },
  { name: "incentive", label: "AMOUNT", field: "incentive", align: "left" },
  {
    name: "ceremony",
    label: "CEREMONY",
    field: "ceremony",
    align: "left",
    hideBelow: "xl",
  },
  ACTIONS_COLUMN,
];

const COLUMN_SETS = {
  default: DEFAULT_COLUMNS,
  service: SERVICE_COLUMNS,
};

/* =========================================================
   STATIC DATA (preview only)
   Only "Service Award/Incentive" has rows; the rest are empty.
========================================================= */
const AWARDS = [
  {
    id: "outstanding-head",
    label: "Most Outstanding Department/Office Head Award",
    caption: "Leadership and office performance",
    description:
      "Recognizes the department or office head with the highest overall leadership and office performance for the year.",
    icon: "workspace_premium",
    tone: "amber",
    columnSet: "default",
    rows: [],
  },
  {
    id: "productive-unit",
    label: "Most Productive Organizational Unit",
    caption: "Highest output per unit",
    description:
      "Awarded to the division or section with the highest accomplishment rate against its approved unit work plan.",
    icon: "groups",
    tone: "teal",
    columnSet: "default",
    rows: [],
  },
  {
    id: "best-attendance",
    label: "Best in Attendance Award",
    caption: "Perfect punctuality and attendance",
    description:
      "Given to employees with no absences, no tardiness and no undertime during the rating period.",
    icon: "event_available",
    tone: "blue",
    columnSet: "default",
    rows: [],
  },
  {
    id: "top-performing",
    label: "Top Performing Employee/s Based on Performance Rating",
    caption: "Highest IPCR ratings",
    description:
      "Ranks employees by final IPCR rating. Only those rated Outstanding are eligible.",
    icon: "emoji_events",
    tone: "purple",
    columnSet: "default",
    rows: [],
  },
  {
    id: "service-award",
    label: "Service Award/Incentive",
    caption: "Retirees with at least 15 years of service",
    description:
      "Conferred to retirees of the City Government of Tagum, under optional or compulsory retirement, with at least 15 years of government service. Presented as a plaque, token and/or cash incentive during the Salamat Mabuhay Program or another ceremony set by the PRAISE Committee.",
    icon: "military_tech",
    tone: "orange",
    columnSet: "service",
    rows: [
      {
        id: 1,
        recipient: "Rosalinda F. Castillo",
        position: "Administrative Assistant III",
        office: "City Civil Registry",
        years: 34,
        retirement_date: "2026-03-31",
        incentive: "₱10,000",
        ceremony: "Salamat Mabuhay Program",
      },
      {
        id: 2,
        recipient: "Fernando A. Gutierrez",
        position: "Foreman",
        office: "General Services Office",
        years: 27,
        retirement_date: "2026-05-15",
        incentive: "₱10,000",
        ceremony: "Salamat Mabuhay Program",
      },
      {
        id: 3,
        recipient: "Imelda S. Roxas",
        position: "Nurse III",
        office: "City Health Office",
        years: 31,
        retirement_date: "2026-11-20",
        incentive: "₱10,000",
        ceremony: "Salamat Mabuhay Program",
      },
      {
        id: 4,
        recipient: "Victor E. Salazar",
        position: "Engineer II",
        office: "City Engineer's Office",
        years: 18,
        retirement_date: "2026-12-01",
        incentive: "₱10,000",
        ceremony: "Set by PRAISE Committee",
      },
      {
        id: 5,
        recipient: "Lorna D. Bernardo",
        position: "Librarian II",
        office: "City Library",
        years: 15,
        retirement_date: "2027-01-10",
        incentive: "₱10,000",
        ceremony: "Set by PRAISE Committee",
      },
    ],
  },
  {
    id: "exemplary-behavior",
    label: "Exemplary Behavior Award",
    caption: "Integrity and good conduct",
    description:
      "Recognizes employees who consistently demonstrate integrity, courtesy and exemplary conduct in public service.",
    icon: "volunteer_activism",
    tone: "green",
    columnSet: "default",
    rows: [],
  },
];

export default defineComponent({
  name: "CustomizedIncentivesPage",

  setup() {
    const $q = useQuasar();

    // ---------- State ----------
    const awards = AWARDS;
    const selectedId = ref("service-award");

    const search = ref("");
    const filterStatus = ref(null);

    const pagination = ref({
      page: 1,
      rowsPerPage: 5,
      sortBy: null,
      descending: false,
    });

    // ---------- Responsive ----------
    const isCompact = computed(() => $q.screen.lt.md);

    // ---------- Derived data ----------
    const awardOptions = computed(() =>
      awards.map((a) => ({
        label: a.label,
        value: a.id,
        caption: a.caption,
        icon: a.icon,
        tone: a.tone,
        count: a.rows.length,
      }))
    );

    const selectedAward = computed(
      () => awards.find((a) => a.id === selectedId.value) || awards[0]
    );

    const columns = computed(
      () => COLUMN_SETS[selectedAward.value.columnSet] || DEFAULT_COLUMNS
    );

    const hasStatusColumn = computed(() =>
      columns.value.some((c) => c.name === "status")
    );

    const visibleColumns = computed(() =>
      columns.value
        .filter((c) => {
          if (c.hideBelow === "lg" && $q.screen.lt.lg) return false;
          if (c.hideBelow === "xl" && $q.screen.lt.xl) return false;
          return true;
        })
        .map((c) => c.name)
    );

    const hasAnyFilter = computed(
      () => !!search.value || (hasStatusColumn.value && !!filterStatus.value)
    );

    const filteredRows = computed(() => {
      let result = selectedAward.value.rows;
      const keyword = search.value?.toLowerCase().trim();

      if (keyword) {
        result = result.filter((r) =>
          Object.values(r).some((v) =>
            String(v).toLowerCase().includes(keyword)
          )
        );
      }
      if (hasStatusColumn.value && filterStatus.value) {
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
    watch([search, filterStatus, selectedId], () => {
      pagination.value.page = 1;
    });

    // ---------- Helpers ----------
    function notify(message, type = "positive") {
      $q.notify({ type, message, position: "top" });
    }

    function onCategoryChange() {
      search.value = "";
      filterStatus.value = null;
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
    }

    /**
     * Fields shown on the compact card — every column except the ones
     * the card already renders separately.
     */
    function cardFields(row) {
      const skip = ["no", "recipient", "status", "actions"];
      return columns.value
        .filter((c) => !skip.includes(c.name))
        .map((c) => {
          const raw = row[c.field];
          const value = c.format ? c.format(raw, row) : raw;
          return { name: c.name, label: c.label, value: value || "—" };
        });
    }

    // ---------- Actions (static preview) ----------
    function viewEntry(row) {
      notify(`Viewing ${row.recipient} (preview only)`);
    }

    function editEntry(row) {
      notify(`Editing ${row.recipient} (preview only)`);
    }

    return {
      // config
      awards,
      awardOptions,
      columns,
      rppOptions: RPP_OPTIONS,
      STATUS_LABELS,
      STATUS_CLASSES,
      statusOptions: STATUS_OPTIONS,

      // state
      selectedId,
      selectedAward,
      search,
      filterStatus,
      pagination,
      isCompact,
      visibleColumns,
      hasStatusColumn,
      hasAnyFilter,
      filteredRows,
      rangeStart,
      rangeEnd,

      // helpers
      onCategoryChange,
      rowNumber,
      goToPage,
      clearFilters,
      cardFields,

      // actions
      viewEntry,
      editEntry,
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

/* =========================================================
   HEADER
========================================================= */
.page-header {
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

/* =========================================================
   CARD
========================================================= */
.incentives-card {
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   CATEGORY SELECTOR
========================================================= */
.category-bar {
  padding: 14px 12px 4px;
}

.category-select {
  width: 100%;
  min-width: 0;
}

.category-select :deep(.q-field__control) {
  min-height: 44px;
}

.category-select :deep(.q-field__native) {
  min-width: 0;
  font-size: 16px;
  font-weight: var(--fw-semibold);
}

.category-select :deep(.q-field__prepend) {
  color: #e8911a;
}

.selected-label {
  display: block;
  min-width: 0;
  overflow: hidden;
  color: #19354a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-option {
  min-height: 60px;
  padding: 8px 12px;
}

.award-avatar {
  min-width: 0;
  padding-right: 12px;
}

.award-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.award-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  white-space: normal;
}

.award-caption {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-sm);
  white-space: normal;
}

.award-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  color: #6f8087;
  background: #f3f6f5;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
}

/* tone colors */
.tone-amber {
  color: #b46e0a;
  background: #fef6ea;
}
.tone-teal {
  color: #0f766e;
  background: #d7f0ed;
}
.tone-blue {
  color: #1c6ea4;
  background: #e6f0fa;
}
.tone-purple {
  color: #7a4fb8;
  background: #f1eafa;
}
.tone-orange {
  color: #c2570c;
  background: #fdeede;
}
.tone-green {
  color: #0c9145;
  background: #e1f7e6;
}

/* =========================================================
   FILTERS
========================================================= */
.filter-section {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.filter-search,
.filter-select {
  min-width: 0;
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

.incentives-table {
  box-shadow: none;
  background: transparent;
}

.incentives-table :deep(th) {
  height: 48px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  border-bottom: 1px solid #edf1ef;
}

.incentives-table :deep(td) {
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
  font-size: var(--fs-sm);
}

.cell-details {
  max-width: clamp(180px, 22vw, 320px);
  color: #425b68;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-incentive {
  color: #2b5f8a;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-normal);
}

/* =========================================================
   BADGES
========================================================= */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-nominated {
  color: #6b7680;
  background: #eef1f4;
}
.status-shortlisted {
  color: #d4880f;
  background: #fef6ea;
}
.status-approved {
  color: #1c6ea4;
  background: #e6f0fa;
}
.status-awarded {
  color: #0c9145;
  background: #e1f7e6;
}

/* =========================================================
   ROW ACTIONS
========================================================= */
.cell-actions {
  white-space: nowrap;
}

.row-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
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

.act-btn--accent {
  color: #b46e0a;
  background: #fef6ea;
}

/* =========================================================
   CARD LIST (compact)
========================================================= */
.incentives-table :deep(.incentive-cards) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  padding: 12px 0;
}

.incentive-card {
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

.card-position {
  margin-top: -4px;
  color: #7d8c93;
  font-size: var(--fs-sm);
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
   >= 600px
========================================================= */
@media (min-width: 600px) {
  .category-bar {
    padding: 16px 16px 4px;
  }

  .filter-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 13px 16px;
  }

  .filter-search {
    flex: 1 1 260px;
    max-width: 380px;
  }

  .filter-select {
    flex: 0 0 160px;
    width: 160px;
  }

  .incentives-table :deep(.incentive-cards) {
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

/* =========================================================
   >= 800px
========================================================= */
@media (min-width: 800px) {
  .category-bar {
    padding: 16px 20px 4px;
  }

  .category-select {
    max-width: 640px;
  }

  .category-select :deep(.q-field__control) {
    min-height: 40px;
  }

  .filter-section {
    padding: 13px 20px;
  }

  .filter-search :deep(.q-field__control),
  .filter-select :deep(.q-field__control) {
    min-height: 38px;
  }
}

/* =========================================================
   >= 1024px
========================================================= */
@media (min-width: 1024px) {
  .incentives-table {
    min-width: 720px;
  }

  .footer-nav .q-btn {
    width: auto;
    height: auto;
  }
}

/* =========================================================
   >= 1440px
========================================================= */
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
  .incentives-table :deep(tbody tr:hover) {
    background: #fefaf5;
  }

  .act-btn--neutral:hover {
    background: #e6ecea;
  }

  .act-btn--accent:hover {
    background: #fdebd0;
  }
}

/* =========================================================
   Accessibility
========================================================= */
@media (prefers-reduced-motion: reduce) {
  .act-btn {
    transition: none;
  }
}
</style>

<style>
/* Unscoped: the dropdown menu renders in a portal outside the component */
.category-popup {
  max-width: min(640px, 94vw);
}
</style>
