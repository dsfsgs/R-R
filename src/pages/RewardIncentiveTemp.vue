<template>
  <q-page class="module-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="page-header-text">
        <h6 class="page-title">Employee Loyalty</h6>
        <p class="page-subtitle">Years of service across all employees.</p>
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
      <!-- PAGE TABS -->
      <q-tabs
        v-model="activeTab"
        align="left"
        no-caps
        dense
        indicator-color="positive"
        active-color="positive"
        class="loyalty-tabs"
      >
        <q-tab name="eligible" label="Eligible Employees" icon="groups" />
        <q-tab
          name="generated"
          label="Generated Lists"
          icon="playlist_add_check"
        >
          <q-badge
            v-if="generatedBatches.length"
            color="positive"
            floating
            rounded
          >
            {{ generatedBatches.length }}
          </q-badge>
        </q-tab>
      </q-tabs>

      <q-separator />

      <!-- ELIGIBLE EMPLOYEES -->
      <div v-if="activeTab === 'eligible'">
        <div class="selection-toolbar">
          <div class="selection-summary">
            <strong>{{ selectedEmployees.length }}</strong>
            employee(s) selected
          </div>
          <q-btn
            unelevated
            no-caps
            icon="playlist_add"
            label="Generate Eligible List"
            class="generate-btn"
            :disable="selectedEmployees.length === 0"
            @click="generateEligibleList"
          />
        </div>

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
            v-model="filterOffice"
            outlined
            dense
            clearable
            emit-value
            map-options
            label="Office"
            :options="officeOptions"
            options-dense
            class="filter-select filter-select--wide"
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
            options-dense
            class="filter-select"
          />

          <q-input
            v-model.number="filterLoyaltyYears"
            outlined
            dense
            clearable
            type="number"
            min="0"
            step="1"
            label="Loyalty Years"
            class="filter-select filter-select--narrow"
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

        <!-- TABLE (desktop) / CARDS (compact) -->
        <div class="table-wrapper">
          <q-table
            flat
            :grid="isCompact"
            :rows="filteredRows"
            :columns="columns"
            :visible-columns="visibleColumns"
            row-key="ControlNo"
            selection="multiple"
            v-model:selected="selectedEmployees"
            :loading="store.loading"
            class="loyalty-table"
            card-container-class="loyalty-cards"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 25, 50, 100]"
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
                <div class="cell-title">
                  {{ props.row.EmployeeName || "—" }}
                </div>
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
                  {{ props.row.Status }}
                </span>
                <span v-else class="milestone-none">—</span>
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
                <div class="cell-years">
                  {{ props.row.LoyaltyService || "—" }}
                </div>
                <div v-if="props.row.LoyaltyServiceStartDate" class="cell-date">
                  <q-icon name="event" size="11px" />
                  Since {{ formatDate(props.row.LoyaltyServiceStartDate) }}
                </div>
              </q-td>
            </template>

            <template #body-cell-honorees="props">
              <q-td :props="props">
                <div class="cell-years">
                  {{ props.row.HonoreesService || "—" }}
                </div>
                <div
                  v-if="props.row.HonoreesServiceStartDate"
                  class="cell-date"
                >
                  <q-icon name="event" size="11px" />
                  Since {{ formatDate(props.row.HonoreesServiceStartDate) }}
                </div>
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
                    {{ props.row.Status }}
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
                    <dt>Total Service</dt>
                    <dd class="card-years">
                      {{ props.row.TotalYearsOfService || "—" }}
                    </dd>
                  </div>
                  <div class="card-field">
                    <dt>Loyalty Service</dt>
                    <dd>
                      {{ props.row.LoyaltyService || "—" }}
                      <div
                        v-if="props.row.LoyaltyServiceStartDate"
                        class="card-sub"
                      >
                        Since
                        {{ formatDate(props.row.LoyaltyServiceStartDate) }}
                      </div>
                    </dd>
                  </div>
                  <div class="card-field">
                    <dt>Honorees Service</dt>
                    <dd>
                      {{ props.row.HonoreesService || "—" }}
                      <div
                        v-if="props.row.HonoreesServiceStartDate"
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
                        : "No employees found."
                      : "Loading loyalty data…"
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
      </div>

      <!-- GENERATED LISTS -->
      <div v-else class="generated-panel">
        <div class="generated-heading">
          <div>
            <div class="generated-title">Generated Eligible Lists</div>
            <div class="generated-subtitle">
              Saved eligibility snapshots. These are not yet official
              nominations.
            </div>
          </div>
        </div>

        <q-table
          flat
          :rows="generatedBatches"
          :columns="batchColumns"
          row-key="reference_no"
          :pagination="{ rowsPerPage: 10 }"
          class="loyalty-table generated-table"
          no-data-label="No eligible lists have been generated."
        >
          <template #body-cell-reference_no="props">
            <q-td :props="props">
              <div class="cell-title">{{ props.row.reference_no }}</div>
              <div class="cell-sub">{{ props.row.award_type }}</div>
            </q-td>
          </template>

          <template #body-cell-total_employees="props">
            <q-td :props="props">
              <span class="cell-years">{{ props.row.employees.length }}</span>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span class="status-badge status-regular">{{
                props.row.status
              }}</span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                no-caps
                icon="visibility"
                label="View"
                class="act-btn act-btn--neutral"
                @click="viewGeneratedBatch(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- GENERATED LIST DETAILS -->
    <q-dialog v-model="showBatchDetails" persistent>
      <q-card class="batch-dialog">
        <q-card-section class="row items-start justify-between">
          <div>
            <div class="generated-title">Eligible List Details</div>
            <div class="generated-subtitle">
              {{ selectedBatch?.reference_no }} ·
              {{ selectedBatch?.award_type }}
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedBatch">
          <div class="batch-meta">
            <div>
              <span>Generated date</span
              ><strong>{{ selectedBatch.generated_at }}</strong>
            </div>
            <div>
              <span>Employees</span
              ><strong>{{ selectedBatch.employees.length }}</strong>
            </div>
            <div>
              <span>Status</span><strong>{{ selectedBatch.status }}</strong>
            </div>
          </div>

          <q-table
            flat
            dense
            :rows="selectedBatch.employees"
            :columns="batchEmployeeColumns"
            row-key="ControlNo"
            :pagination="{ rowsPerPage: 10 }"
            class="loyalty-table"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat no-caps label="Close" color="grey-8" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { useLoyaltyStore } from "src/stores/loyaltyStore";
import ServiceRecordDialog from "src/components/ServiceRecordDialog.vue";

/* =========================================================
   COLUMNS
========================================================= */
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

/* =========================================================
   HELPERS
========================================================= */

function parseYears(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;

  const s = String(value).trim();
  if (!s) return 0;

  const y = s.match(/(\d+)\s*(?:year|yr)/i);
  const m = s.match(/(\d+)\s*(?:month|mo)/i);

  const years = y ? Number(y[1]) : 0;
  const months = m ? Number(m[1]) : 0;

  return years + months / 12;
}

/* Whole-year part only: "10 years 11 months" -> 10 */
function wholeYears(value) {
  const s = String(value ?? "").trim();
  if (!s) return 0;
  const y = s.match(/(\d+)\s*(?:year|yr)/i);
  return y ? Number(y[1]) : 0;
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

export default defineComponent({
  name: "LoyaltyPage",

  components: { ServiceRecordDialog },

  setup() {
    const $q = useQuasar();
    const store = useLoyaltyStore();

    /* =========================================================
       ELIGIBILITY LIST STATE
    ========================================================= */
    const activeTab = ref("eligible");
    const selectedEmployees = ref([]);
    const showBatchDetails = ref(false);
    const selectedBatch = ref(null);

    // Front-end demo data. Replace this with API-loaded batches when backend endpoints are ready.
    const generatedBatches = ref([
      {
        reference_no: "LOY-2026-001",
        award_type: "Loyalty Award",
        status: "Generated",
        generated_at: "November 9, 2026",
        employees: [
          {
            ControlNo: "SAMPLE-001",
            EmployeeName: "Sample Employee 1",
            Designation: "Administrative Officer",
            Office: "Human Resource Management Office",
            LoyaltyService: "10 years",
          },
          {
            ControlNo: "SAMPLE-002",
            EmployeeName: "Sample Employee 2",
            Designation: "Administrative Assistant",
            Office: "City Accounting Office",
            LoyaltyService: "15 years",
          },
        ],
      },
    ]);

    const batchColumns = [
      {
        name: "reference_no",
        label: "REFERENCE / AWARD",
        field: "reference_no",
        align: "left",
      },
      {
        name: "generated_at",
        label: "DATE GENERATED",
        field: "generated_at",
        align: "left",
      },
      {
        name: "total_employees",
        label: "EMPLOYEES",
        field: "employees",
        align: "center",
      },
      { name: "status", label: "STATUS", field: "status", align: "left" },
      { name: "actions", label: "ACTIONS", field: "actions", align: "left" },
    ];

    const batchEmployeeColumns = [
      {
        name: "ControlNo",
        label: "CONTROL NO.",
        field: "ControlNo",
        align: "left",
      },
      {
        name: "EmployeeName",
        label: "EMPLOYEE",
        field: "EmployeeName",
        align: "left",
      },
      {
        name: "Designation",
        label: "DESIGNATION",
        field: "Designation",
        align: "left",
      },
      { name: "Office", label: "OFFICE", field: "Office", align: "left" },
      {
        name: "LoyaltyService",
        label: "LOYALTY SERVICE",
        field: "LoyaltyService",
        align: "left",
      },
    ];

    /* =========================================================
       STATE
    ========================================================= */
    const search = ref("");
    const filterOffice = ref(null);
    const filterStatus = ref(null);
    const filterLoyaltyYears = ref(null);

    const pagination = ref({
      page: 1,
      rowsPerPage: 5,
      sortBy: null,
      descending: false,
    });

    /* Service-record dialog state */
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
    const officeOptions = computed(() => {
      const set = new Set();
      for (const e of store.employees) {
        if (e.Office) set.add(e.Office);
      }
      return [...set].sort().map((v) => ({ label: v, value: v }));
    });

    const statusOptions = computed(() => {
      const set = new Set();
      for (const e of store.employees) {
        if (e.Status) set.add(e.Status);
      }
      return [...set].sort().map((v) => ({ label: v, value: v }));
    });

    /* =========================================================
       COMPUTED — rows
    ========================================================= */
    const rows = computed(() => {
      const list = store.employees;
      return [...list].sort(
        (a, b) =>
          parseYears(b.TotalYearsOfService) - parseYears(a.TotalYearsOfService)
      );
    });

    const hasLoyaltyYearsFilter = computed(
      () =>
        filterLoyaltyYears.value !== null &&
        filterLoyaltyYears.value !== "" &&
        filterLoyaltyYears.value !== undefined
    );

    const hasAnyFilter = computed(
      () =>
        !!search.value?.trim() ||
        !!filterOffice.value ||
        !!filterStatus.value ||
        hasLoyaltyYearsFilter.value
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

      if (filterOffice.value) {
        result = result.filter((r) => r.Office === filterOffice.value);
      }

      if (filterStatus.value) {
        result = result.filter((r) => r.Status === filterStatus.value);
      }

      /* Exact whole years: 10 matches 10 years 0 months to 10 years 11 months */
      if (hasLoyaltyYearsFilter.value) {
        const target = Math.floor(Number(filterLoyaltyYears.value));
        if (!Number.isNaN(target)) {
          result = result.filter(
            (r) => !!r.LoyaltyService && wholeYears(r.LoyaltyService) === target
          );
        }
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
    watch([search, filterOffice, filterStatus, filterLoyaltyYears], () => {
      pagination.value.page = 1;
    });

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
       HELPERS
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
      filterOffice.value = null;
      filterStatus.value = null;
      filterLoyaltyYears.value = null;
    }

    function statusClass(status) {
      if (!status) return "status-default";
      const s = String(status).toLowerCase();
      if (s === "regular" || s === "permanent") return "status-regular";
      if (
        s === "honorarium" ||
        s === "contractual" ||
        s === "casual" ||
        s === "co-terminus"
      ) {
        return "status-temporary";
      }
      if (s === "elective") return "status-elective";
      return "status-default";
    }

    /* ---------- Generate an eligible employee snapshot ---------- */
    function generateEligibleList() {
      if (!selectedEmployees.value.length) {
        notify("Select at least one employee first.", "warning");
        return;
      }

      const nextNumber = generatedBatches.value.length + 1;
      const referenceNo = `LOY-${new Date().getFullYear()}-${String(
        nextNumber
      ).padStart(3, "0")}`;

      const employeesSnapshot = selectedEmployees.value.map((employee) => ({
        ControlNo: employee.ControlNo,
        EmployeeName: employee.EmployeeName,
        Designation: employee.Designation,
        Office: employee.Office,
        LoyaltyService: employee.LoyaltyService,
        HonoreesService: employee.HonoreesService,
        TotalYearsOfService: employee.TotalYearsOfService,
      }));

      const batch = {
        reference_no: referenceNo,
        award_type: "Loyalty Award",
        status: "Generated",
        generated_at: new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        employees: employeesSnapshot,
      };

      generatedBatches.value.unshift(batch);
      selectedEmployees.value = [];
      activeTab.value = "generated";
      notify(`Eligible list ${referenceNo} generated successfully.`);
    }

    function viewGeneratedBatch(batch) {
      selectedBatch.value = batch;
      showBatchDetails.value = true;
    }

    /* ---------- Service record modal ---------- */
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

      // eligibility lists
      activeTab,
      selectedEmployees,
      generatedBatches,
      batchColumns,
      batchEmployeeColumns,
      showBatchDetails,
      selectedBatch,

      // state
      search,
      filterOffice,
      filterStatus,
      filterLoyaltyYears,
      pagination,
      isCompact,
      visibleColumns,
      filteredRows,
      rangeStart,
      rangeEnd,
      hasAnyFilter,
      officeOptions,
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
      formatDate,

      // actions
      reload,
      generateEligibleList,
      viewGeneratedBatch,
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
   ELIGIBILITY TABS AND GENERATED LISTS
========================================================= */
.loyalty-tabs {
  min-height: 48px;
  padding: 0 12px;
  color: #718089;
  background: #ffffff;
}

.selection-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #edf1ef;
  background: #ffffff;
}

.selection-summary {
  color: #718089;
  font-size: var(--fs-sm);
}

.selection-summary strong {
  color: #19354a;
  font-weight: var(--fw-bold);
}

.generate-btn {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  color: #ffffff;
  background: #16834a;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}

.generate-btn:disabled {
  opacity: 0.45 !important;
}

.generated-panel {
  padding: 16px;
}

.generated-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.generated-title {
  color: #19354a;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
}

.generated-subtitle {
  margin-top: 3px;
  color: #718089;
  font-size: var(--fs-sm);
}

.batch-dialog {
  width: 900px;
  max-width: 95vw;
}

.batch-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.batch-meta > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border: 1px solid #edf1ef;
  border-radius: 6px;
  background: #fcfdfc;
}

.batch-meta span {
  color: #718089;
  font-size: var(--fs-xs);
}

.batch-meta strong {
  color: #19354a;
  font-size: var(--fs-sm);
}

@media (max-width: 599px) {
  .batch-meta {
    grid-template-columns: 1fr;
  }

  .selection-toolbar {
    align-items: stretch;
  }

  .generate-btn {
    width: 100%;
  }
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

.filter-select--wide {
  grid-column: 1 / -1;
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

  .filter-select--wide {
    flex: 0 0 220px;
    width: 220px;
  }

  .filter-select--narrow {
    flex: 0 0 160px;
    width: 160px;
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
    min-width: 1250px;
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
 