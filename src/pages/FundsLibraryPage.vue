<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-header-text">
        <h6>Funds Library</h6>
        <p>
          Manage the annual Rewards &amp; Recognition budget and monitor spent
          and available balances per fund.
        </p>
      </div>

      <div class="header-actions">
        <q-btn
          unelevated
          no-caps
          icon="add"
          label="New Fund"
          class="add-btn"
          @click="openCreate"
        />
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
         SUMMARY STRIP
    ====================================================== -->
    <div class="summary-strip">
      <div class="summary-cell">
        <div class="summary-label">Total Allocated</div>
        <div class="summary-value">{{ formatCurrency(totals.allocated) }}</div>
      </div>
      <div class="summary-cell">
        <div class="summary-label">Total Spent</div>
        <div class="summary-value">{{ formatCurrency(totals.spent) }}</div>
      </div>
      <div class="summary-cell summary-cell--highlight">
        <div class="summary-label">Total Available</div>
        <div class="summary-value summary-value--highlight">
          {{ formatCurrency(totals.available) }}
        </div>
      </div>
    </div>

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
          placeholder="Search by fund name..."
          class="search-input"
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
          class="status-filter"
        />

        <q-select
          v-model="filterYear"
          outlined
          dense
          clearable
          emit-value
          map-options
          label="Fiscal Year"
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

      <!-- TABLE -->
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

          <template #body-cell-fiscal_year="props">
            <q-td :props="props">
              <div class="user-name">{{ props.row.fiscal_year }}</div>
              <div class="cell-sub">FY</div>
            </q-td>
          </template>

          <template #body-cell-fund_name="props">
            <q-td :props="props">
              <div class="user-name">{{ props.row.fund_name }}</div>
              <div class="cell-sub">Fund #{{ props.row.id }}</div>
            </q-td>
          </template>

          <template #body-cell-allocated="props">
            <q-td :props="props">
              <span class="amount-cell">
                {{ formatCurrency(props.row.allocated_amount) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-spent="props">
            <q-td :props="props">
              <span class="stat-cell">
                {{ formatCurrency(summaryOf(props.row)?.actual_expenses ?? 0) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-available="props">
            <q-td :props="props">
              <span class="amount-cell amount-cell--highlight">
                {{
                  formatCurrency(
                    summaryOf(props.row)?.available ??
                      props.row.allocated_amount
                  )
                }}
              </span>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                class="role-badge"
                :class="STATUS_CLASSES[props.row.status]"
              >
                {{ STATUS_LABELS[props.row.status] || props.row.status }}
              </span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="row-actions">
                <q-btn
                  flat
                  dense
                  no-caps
                  icon="receipt_long"
                  label="Ledger"
                  class="row-btn row-btn--neutral"
                  @click="openLedger(props.row)"
                />
                <q-btn
                  flat
                  dense
                  no-caps
                  icon="edit"
                  label="Edit"
                  class="row-btn row-btn--warning"
                  @click="openEdit(props.row)"
                />
                <q-btn
                  flat
                  dense
                  no-caps
                  icon="delete"
                  label="Delete"
                  class="row-btn row-btn--danger"
                  @click="openDelete(props.row)"
                />
              </div>
            </q-td>
          </template>

          <!-- ============ MOBILE / TABLET CARDS ============ -->
          <template #item="props">
            <div class="col-12 col-sm-6 card-col">
              <q-card flat bordered class="fund-card">
                <div class="fund-card__head">
                  <div class="fund-card__title">
                    <div class="user-name">{{ props.row.fund_name }}</div>
                    <div class="cell-sub">
                      FY {{ props.row.fiscal_year }} · Fund #{{ props.row.id }}
                    </div>
                  </div>
                  <span
                    class="role-badge"
                    :class="STATUS_CLASSES[props.row.status]"
                  >
                    {{ STATUS_LABELS[props.row.status] || props.row.status }}
                  </span>
                </div>

                <div class="fund-card__body">
                  <div class="fund-card__row">
                    <span class="fund-card__label">Allocated</span>
                    <span class="amount-cell">
                      {{ formatCurrency(props.row.allocated_amount) }}
                    </span>
                  </div>
                  <div class="fund-card__row">
                    <span class="fund-card__label">Spent</span>
                    <span class="stat-cell">
                      {{
                        formatCurrency(
                          summaryOf(props.row)?.actual_expenses ?? 0
                        )
                      }}
                    </span>
                  </div>
                  <div class="fund-card__row">
                    <span class="fund-card__label">Available</span>
                    <span class="amount-cell amount-cell--highlight">
                      {{
                        formatCurrency(
                          summaryOf(props.row)?.available ??
                            props.row.allocated_amount
                        )
                      }}
                    </span>
                  </div>
                </div>

                <div class="fund-card__actions">
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="receipt_long"
                    label="Ledger"
                    class="row-btn row-btn--neutral"
                    @click="openLedger(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="edit"
                    label="Edit"
                    class="row-btn row-btn--warning"
                    @click="openEdit(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="delete"
                    label="Delete"
                    class="row-btn row-btn--danger"
                    @click="openDelete(props.row)"
                  />
                </div>
              </q-card>
            </div>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="savings" size="34px" />
              <div>No funds found.</div>
            </div>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- =====================================================
         CREATE / EDIT DIALOG
    ====================================================== -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="form-dialog">
        <div class="form-header">
          <q-icon
            :name="editingFund ? 'edit' : 'add_circle'"
            size="22px"
            class="form-icon"
          />
          <div class="form-header-text">
            <div class="form-title">
              {{ editingFund ? "Edit Fund" : "Create Fund" }}
            </div>
            <div class="form-sub">
              {{
                editingFund
                  ? "Update this fund's budget."
                  : "Add a new annual R&R budget."
              }}
            </div>
          </div>
        </div>

        <div class="form-body">
          <q-input
            v-model="form.fund_name"
            outlined
            dense
            label="Fund Name"
            maxlength="150"
            :error="!!formErrors.fund_name"
            :error-message="formErrors.fund_name"
          />

          <q-input
            v-model.number="form.fiscal_year"
            type="number"
            outlined
            dense
            label="Fiscal Year"
            :disable="!!editingFund"
            :error="!!formErrors.fiscal_year"
            :error-message="formErrors.fiscal_year"
          />

          <q-input
            v-model.number="form.allocated_amount"
            type="number"
            outlined
            dense
            label="Allocated Amount"
            prefix="₱"
            :error="!!formErrors.allocated_amount"
            :error-message="formErrors.allocated_amount"
          />

          <q-select
            v-model="form.status"
            outlined
            dense
            emit-value
            map-options
            label="Status"
            :options="statusOptions"
            :error="!!formErrors.status"
            :error-message="formErrors.status"
          />
        </div>

        <div class="form-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            v-close-popup
            :disable="store.isSaving"
          />
          <q-btn
            unelevated
            no-caps
            :label="editingFund ? 'Save Changes' : 'Create Fund'"
            class="success-btn"
            :loading="store.isSaving"
            @click="saveForm"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         DELETE CONFIRMATION
    ====================================================== -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon danger-confirm-icon">
          <q-icon name="delete_forever" size="25px" />
        </div>
        <div class="confirmation-title">Delete fund?</div>
        <div class="confirmation-message">
          <strong>{{ activeRow?.fund_name }}</strong> (FY
          {{ activeRow?.fiscal_year }}) will be permanently deleted. Funds with
          existing transactions cannot be deleted — set them to
          <strong>CLOSED</strong> instead.
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            v-close-popup
            :disable="store.isSaving"
          />
          <q-btn
            unelevated
            no-caps
            label="Delete fund"
            class="danger-btn"
            :loading="store.isSaving"
            @click="confirmDelete"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         LEDGER DRAWER
    ====================================================== -->
    <q-dialog v-model="showLedgerDialog">
      <q-card class="ledger-dialog">
        <div class="ledger-header">
          <div>
            <div class="form-title">Ledger — {{ activeRow?.fund_name }}</div>
            <div class="form-sub">
              FY {{ activeRow?.fiscal_year }} · Fund #{{ activeRow?.id }}
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>

        <div class="ledger-body">
          <q-inner-loading :showing="store.isLoadingTransactions" />

          <div
            v-if="
              !store.isLoadingTransactions && store.transactions.length === 0
            "
            class="table-empty"
          >
            <q-icon name="receipt_long" size="34px" />
            <div>No transactions yet.</div>
          </div>

          <div v-else class="ledger-list">
            <div
              v-for="tx in store.transactions"
              :key="tx.id"
              class="ledger-row"
            >
              <div class="ledger-row__main">
                <div class="user-name">
                  {{ tx.description || tx.reference_no || "—" }}
                </div>
                <div class="cell-sub">
                  {{ tx.reference_no || "—" }} · {{ tx.transaction_type }} ·
                  {{ tx.status }}
                </div>
              </div>
              <div class="ledger-row__right">
                <span class="amount-cell" :class="txClass(tx)">
                  {{ formatCurrency(tx.amount) }}
                </span>
                <div class="cell-sub">{{ formatDate(tx.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, reactive, onMounted } from "vue";
import { Notify, useQuasar } from "quasar";
import { useFundStore } from "src/stores/fundStore";

const STATUS_LABELS = { ACTIVE: "Active", CLOSED: "Closed" };
const STATUS_CLASSES = { ACTIVE: "role-employee", CLOSED: "role-danger" };

export default defineComponent({
  name: "FundsLibraryPage",

  setup() {
    const $q = useQuasar();
    const store = useFundStore();

    const search = ref("");
    const filterStatus = ref(null);
    const filterYear = ref(null);
    const pagination = ref({ page: 1, rowsPerPage: 10 });
    const isCompact = computed(() => $q.screen.lt.md);

    // dialogs
    const showFormDialog = ref(false);
    const showDeleteDialog = ref(false);
    const showLedgerDialog = ref(false);
    const editingFund = ref(null);
    const activeRow = ref(null);

    // create / edit form
    const form = reactive({
      fund_name: "",
      fiscal_year: new Date().getFullYear(),
      allocated_amount: 0,
      status: "ACTIVE",
    });
    const formErrors = reactive({
      fund_name: "",
      fiscal_year: "",
      allocated_amount: "",
      status: "",
    });

    // ---------- columns ----------
    const columns = [
      { name: "no", label: "NO.", field: "id", align: "left" },
      {
        name: "fiscal_year",
        label: "FY",
        field: "fiscal_year",
        align: "left",
        sortable: true,
      },
      {
        name: "fund_name",
        label: "FUND",
        field: "fund_name",
        align: "left",
        sortable: true,
      },
      {
        name: "allocated",
        label: "ALLOCATED",
        field: "allocated_amount",
        align: "left",
        sortable: true,
      },
      { name: "spent", label: "SPENT", field: "spent", align: "left" },
      {
        name: "available",
        label: "AVAILABLE",
        field: "available",
        align: "left",
      },
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
    const statusOptions = [
      { label: "Active", value: "ACTIVE" },
      { label: "Closed", value: "CLOSED" },
    ];

    const yearOptions = computed(() => {
      const set = new Set(store.rows.map((r) => r.fiscal_year));
      if (set.size === 0) set.add(new Date().getFullYear());
      return Array.from(set)
        .sort((a, b) => b - a)
        .map((y) => ({ label: String(y), value: y }));
    });

    // ---------- filters ----------
    const hasAnyFilter = computed(
      () => !!search.value || !!filterStatus.value || !!filterYear.value
    );

    const filteredRows = computed(() => {
      let rows = store.rows;
      const keyword = search.value?.toLowerCase().trim();

      if (keyword) {
        rows = rows.filter((r) => r.fund_name?.toLowerCase().includes(keyword));
      }
      if (filterStatus.value)
        rows = rows.filter((r) => r.status === filterStatus.value);
      if (filterYear.value)
        rows = rows.filter((r) => r.fiscal_year === filterYear.value);

      return rows;
    });

    // ---------- summary totals (no reserved) ----------
    const totals = computed(() => {
      return store.rows.reduce(
        (acc, fund) => {
          const s = store.summaries[fund.id];
          acc.allocated += Number(fund.allocated_amount) || 0;
          acc.spent += Number(s?.actual_expenses) || 0;
          acc.available += Number(s?.available ?? fund.allocated_amount) || 0;
          return acc;
        },
        { allocated: 0, spent: 0, available: 0 }
      );
    });

    function summaryOf(fund) {
      return store.summaries[fund.id] || null;
    }

    // continuous row numbering
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

    // ---------- create / edit ----------
    function resetForm() {
      form.fund_name = "";
      form.fiscal_year = new Date().getFullYear();
      form.allocated_amount = 0;
      form.status = "ACTIVE";
      Object.keys(formErrors).forEach((k) => (formErrors[k] = ""));
    }

    function openCreate() {
      editingFund.value = null;
      resetForm();
      showFormDialog.value = true;
    }

    function openEdit(row) {
      editingFund.value = row;
      form.fund_name = row.fund_name;
      form.fiscal_year = row.fiscal_year;
      form.allocated_amount = Number(row.allocated_amount);
      form.status = row.status;
      Object.keys(formErrors).forEach((k) => (formErrors[k] = ""));
      showFormDialog.value = true;
    }

    async function saveForm() {
      Object.keys(formErrors).forEach((k) => (formErrors[k] = ""));

      // light client-side validation — the server is still the source of truth
      if (!form.fund_name?.trim()) {
        formErrors.fund_name = "Fund name is required.";
        return;
      }
      if (form.allocated_amount === null || form.allocated_amount < 0) {
        formErrors.allocated_amount = "Amount must be zero or positive.";
        return;
      }
      if (
        !editingFund.value &&
        (!form.fiscal_year ||
          form.fiscal_year < 2000 ||
          form.fiscal_year > 2100)
      ) {
        formErrors.fiscal_year = "Fiscal year must be between 2000 and 2100.";
        return;
      }

      const payload = editingFund.value
        ? {
            fund_name: form.fund_name.trim(),
            allocated_amount: Number(form.allocated_amount),
            status: form.status,
          }
        : {
            fund_name: form.fund_name.trim(),
            fiscal_year: Number(form.fiscal_year),
            allocated_amount: Number(form.allocated_amount),
            status: form.status,
          };

      const result = editingFund.value
        ? await store.update(editingFund.value.id, payload)
        : await store.create(payload);

      if (!result.success) {
        Notify.create({ type: "negative", message: result.message });
        return;
      }

      Notify.create({ type: "positive", message: result.message });
      showFormDialog.value = false;
      editingFund.value = null;
    }

    // ---------- delete ----------
    function openDelete(row) {
      activeRow.value = row;
      showDeleteDialog.value = true;
    }

    async function confirmDelete() {
      if (!activeRow.value) return;
      const result = await store.destroy(activeRow.value.id);

      if (!result.success) {
        Notify.create({ type: "negative", message: result.message });
        return;
      }
      Notify.create({ type: "positive", message: result.message });
      showDeleteDialog.value = false;
      activeRow.value = null;
    }

    // ---------- ledger (by fund id, not fiscal year) ----------
    async function openLedger(row) {
      activeRow.value = row;
      showLedgerDialog.value = true;
      const result = await store.fetchTransactions(row.id);
      if (!result.success) {
        Notify.create({ type: "negative", message: result.message });
      }
    }

    function txClass(tx) {
      if (tx.transaction_type === "EXPENSE") return "amount-cell--spent";
      if (tx.transaction_type === "ADJUSTMENT") return "amount-cell--reserved";
      return "";
    }

    // ---------- helpers ----------
    function clearFilters() {
      search.value = "";
      filterStatus.value = null;
      filterYear.value = null;
    }

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

    return {
      store,
      columns,
      pagination,
      isCompact,
      search,
      filterStatus,
      filterYear,
      statusOptions,
      yearOptions,
      hasAnyFilter,
      filteredRows,
      totals,
      STATUS_LABELS,
      STATUS_CLASSES,
      showFormDialog,
      showDeleteDialog,
      showLedgerDialog,
      editingFund,
      activeRow,
      form,
      formErrors,
      reload,
      rowNumber,
      summaryOf,
      openCreate,
      openEdit,
      saveForm,
      openDelete,
      confirmDelete,
      openLedger,
      clearFilters,
      txClass,
      formatCurrency,
      formatDate,
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

.add-btn {
  min-height: 34px;
  padding: 0 14px;
  color: #ffffff;
  background: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
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
   SUMMARY STRIP — 3 cells now
========================================================= */
.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.summary-cell {
  padding: 12px 14px;
  border: 1px solid #edf1ef;
  border-radius: 10px;
  background: #ffffff;
}

.summary-cell--highlight {
  border-color: #b8e0c3;
  background: #f3fbf5;
}

.summary-label {
  color: #6f8087;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.summary-value {
  margin-top: 4px;
  color: #19354a;
  font-size: 18px;
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  overflow-wrap: anywhere;
}

.summary-value--highlight {
  color: #0c9145;
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
  grid-template-columns: minmax(200px, 1.6fr) repeat(2, minmax(0, 1fr)) auto;
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
   TABLE
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

.amount-cell--highlight {
  color: #0c9145;
}

.amount-cell--reserved {
  color: #9b6200;
}

.amount-cell--spent {
  color: #c73f3f;
}

.stat-cell {
  color: #425b68;
  font-weight: var(--fw-semibold);
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

.row-btn--warning {
  color: #9b6200;
  background: #fff3d9;
}

.row-btn--neutral {
  color: #356c82;
  background: #e8f4f8;
}

/* =========================================================
   MOBILE / TABLET CARDS
========================================================= */
.card-col {
  padding: 6px;
  box-sizing: border-box;
}

.fund-card {
  height: 100%;
  padding: 14px;
  border-color: #edf1ef;
  border-radius: 10px;
  background: #ffffff;
}

.fund-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf1ef;
}

.fund-card__title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.fund-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
}

.fund-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--fs-base);
}

.fund-card__label {
  flex-shrink: 0;
  color: #6f8087;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.fund-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #edf1ef;
}

.fund-card__actions .row-btn {
  flex: 1 1 100px;
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
   FORM DIALOG
========================================================= */
.form-dialog {
  width: 460px;
  max-width: 92vw;
  max-height: 92vh;
  overflow-y: auto;
  padding: 22px 24px;
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #edf1ef;
}

.form-icon {
  color: #19354a;
  margin-top: 2px;
}

.form-header-text {
  min-width: 0;
}

.form-title {
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
}

.form-sub {
  margin-top: 2px;
  color: #718089;
  font-size: var(--fs-sm);
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid #edf1ef;
}

/* =========================================================
   CONFIRMATION DIALOG
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
   LEDGER DIALOG
========================================================= */
.ledger-dialog {
  width: 560px;
  max-width: 94vw;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ledger-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #edf1ef;
}

.ledger-body {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 16px;
}

.ledger-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ledger-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #edf1ef;
}

.ledger-row:last-child {
  border-bottom: none;
}

.ledger-row__main {
  min-width: 0;
  overflow-wrap: anywhere;
}

.ledger-row__right {
  flex-shrink: 0;
  text-align: right;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1200px) {
  .filter-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-input {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .summary-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

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

  .add-btn,
  .refresh-btn {
    flex: 1;
  }

  .filter-section {
    grid-template-columns: 1fr;
    padding: 12px 14px;
  }

  .clear-btn {
    justify-self: stretch;
  }

  .summary-strip {
    grid-template-columns: 1fr;
  }

  .users-table :deep(.q-table__bottom) {
    justify-content: center;
  }

  .form-dialog {
    padding: 18px 16px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .q-btn {
    width: 100%;
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
