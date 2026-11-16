<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h5>Awards & Recognition</h5>
        <p>
          Manage organizational awards, exemplary recognition, and special
          citations.
        </p>
      </div>

      <q-btn
        unelevated
        no-caps
        icon="add"
        label="Give Award"
        class="add-event-btn"
        @click="openAddAward"
      />
    </section>

    <!-- =====================================================
         STATISTICS CARDS
    ====================================================== -->
    <section class="stats-grid">
      <q-card flat class="stat-card">
        <div class="stat-icon gold">
          <q-icon name="emoji_events" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-label">Outstanding Awards</div>
          <div class="stat-value">45</div>
        </div>
      </q-card>

      <q-card flat class="stat-card">
        <div class="stat-icon orange">
          <q-icon name="star" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-label">Exemplary Recognition</div>
          <div class="stat-value">28</div>
        </div>
      </q-card>

      <q-card flat class="stat-card">
        <div class="stat-icon green">
          <q-icon name="military_tech" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-label">Service Awards</div>
          <div class="stat-value">67</div>
        </div>
      </q-card>
    </section>

    <!-- =====================================================
         AWARDS CARD
    ====================================================== -->
    <q-card flat class="events-card">
      <!-- Filters -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by award name or recipient..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="filterCategory"
          outlined
          dense
          clearable
          label="Award Category"
          :options="categoryFilterOptions"
          class="filter-select"
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

      <!-- Table -->
      <div class="table-wrapper">
        <q-table
          flat
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          hide-pagination
          :rows-per-page-options="[0]"
          :loading="loading"
          class="events-table"
        >
          <!-- Recipient -->
          <template #body-cell-recipient="props">
            <q-td :props="props">
              <div class="event-name">{{ props.row.recipient }}</div>
              <div class="event-meta">{{ props.row.department }}</div>
            </q-td>
          </template>

          <!-- Category -->
          <template #body-cell-category="props">
            <q-td :props="props">
              <span
                class="category-badge"
                :class="getCategoryClass(props.row.category)"
              >
                {{ getCategoryLabel(props.row.category) }}
              </span>
            </q-td>
          </template>

          <!-- Status -->
          <template #body-cell-status="props">
            <q-td :props="props">
              <span class="status-badge" :class="statusClass(props.row.status)">
                {{ props.row.status }}
              </span>
            </q-td>
          </template>

          <!-- Actions -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  class="action-view"
                  @click="viewAward(props.row.id)"
                >
                  <q-tooltip>View</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  class="action-edit"
                  @click="editAward(props.row)"
                >
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  class="action-delete"
                  @click="confirmDeleteAward(props.row)"
                >
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="table-empty">No awards found.</div>
          </template>
        </q-table>
      </div>

      <!-- Footer -->
      <div class="table-footer">
        <span>
          Showing <strong>{{ filteredRows.length }}</strong> of
          <strong>{{ awards.length }}</strong> awards
        </span>
      </div>
    </q-card>

    <!-- =====================================================
         ADD/EDIT AWARD DIALOG
    ====================================================== -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="event-dialog" style="width: 650px; max-width: 92vw">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">
              {{ isEditMode ? "Edit" : "Give" }} Award
            </div>
            <div class="dialog-subtitle">
              {{
                isEditMode
                  ? "Update award details."
                  : "Recognize an employee with an award."
              }}
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <!-- Recipient Information -->
          <div class="section-label">Recipient Information</div>
          <div class="form-grid">
            <q-input
              v-model="form.recipient"
              outlined
              dense
              label="Recipient Name"
              class="col-span-2"
            />
            <q-input
              v-model="form.department"
              outlined
              dense
              label="Department"
              class="col-span-2"
            />
            <q-input v-model="form.position" outlined dense label="Position" />
            <q-input
              v-model="form.date_given"
              outlined
              dense
              label="Date Given"
              type="date"
            />
          </div>

          <!-- Award Details -->
          <div class="section-label">Award Details</div>
          <div class="form-grid">
            <q-input
              v-model="form.award_name"
              outlined
              dense
              label="Award Name"
              class="col-span-2"
            />
            <q-select
              v-model="form.category"
              outlined
              dense
              emit-value
              map-options
              :options="categoryOptions"
              label="Award Category"
            />
            <q-input
              v-model="form.awarding_body"
              outlined
              dense
              label="Awarding Body"
              class="col-span-2"
            />
          </div>

          <!-- Award Description -->
          <div class="section-label">Citation / Description</div>
          <q-input
            v-model="form.citation"
            outlined
            dense
            label="Citation Details"
            type="textarea"
          />

          <!-- Additional Fields for Outstanding Awards -->
          <div v-if="form.category === 'outstanding'" class="dynamic-section">
            <div class="section-label">Outstanding Award Details</div>
            <div class="form-grid">
              <q-select
                v-model="form.outstanding_type"
                outlined
                dense
                emit-value
                map-options
                :options="outstandingTypeOptions"
                label="Outstanding Type"
              />
              <q-input
                v-model="form.nomination_count"
                outlined
                dense
                label="Number of Nominations"
                type="number"
              />
              <q-input
                v-model="form.competition_level"
                outlined
                dense
                label="Competition Level"
              />
            </div>
          </div>

          <!-- Status -->
          <div class="section-label">Status</div>
          <q-select
            v-model="form.status"
            outlined
            dense
            emit-value
            map-options
            :options="statusOptions"
            label="Status"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="isEditMode ? 'Save Changes' : 'Give Award'"
            class="save-btn"
            :loading="loading"
            @click="saveAward"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card class="delete-dialog">
        <q-card-section class="dialog-body">
          <div class="delete-title">Delete Award</div>
          <div class="delete-message">
            Are you sure you want to delete this award? This action cannot be
            undone.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Delete"
            class="delete-btn"
            :loading="loading"
            @click="deleteAward"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "AwardsPage",

  setup() {
    const $q = useQuasar();
    const search = ref("");
    const filterCategory = ref(null);
    const loading = ref(false);
    const showFormDialog = ref(false);
    const showDeleteDialog = ref(false);
    const isEditMode = ref(false);
    const editingId = ref(null);

    // Options
    const categoryOptions = [
      { label: "Outstanding Award", value: "outstanding" },
      { label: "Exemplary Recognition", value: "exemplary" },
      { label: "Service Award", value: "service" },
      { label: "Special Citation", value: "citation" },
    ];

    const outstandingTypeOptions = [
      { label: "Employee of the Year", value: "employee_year" },
      { label: "Best Department", value: "best_dept" },
      { label: "Leadership Excellence", value: "leadership" },
      { label: "Innovation Excellence", value: "innovation" },
    ];

    const statusOptions = [
      { label: "Approved", value: "approved" },
      { label: "Pending", value: "pending" },
      { label: "Presented", value: "presented" },
    ];

    const categoryFilterOptions = [
      { label: "Outstanding Award", value: "outstanding" },
      { label: "Exemplary Recognition", value: "exemplary" },
      { label: "Service Award", value: "service" },
      { label: "Special Citation", value: "citation" },
    ];

    // Columns
    const columns = [
      { name: "no", label: "NO.", field: "no", align: "left" },
      {
        name: "recipient",
        label: "RECIPIENT",
        field: "recipient",
        align: "left",
        sortable: true,
      },
      {
        name: "award_name",
        label: "AWARD",
        field: "award_name",
        align: "left",
      },
      { name: "category", label: "CATEGORY", field: "category", align: "left" },
      { name: "date", label: "DATE GIVEN", field: "date", align: "left" },
      { name: "status", label: "STATUS", field: "status", align: "left" },
      { name: "actions", label: "", field: "actions", align: "right" },
    ];

    // Data
    const awards = ref([
      {
        id: 1,
        no: 1,
        recipient: "Maria Santos",
        department: "HR Department",
        position: "HR Specialist",
        award_name: "Outstanding Employee of the Year",
        category: "outstanding",
        awarding_body: "City Government of Tagum",
        citation: "For exceptional dedication and outstanding performance",
        date_given: "2025-12-15",
        status: "presented",
        outstanding_type: "employee_year",
        nomination_count: 25,
        competition_level: "City-wide",
        date: "2025-12-15",
      },
      {
        id: 2,
        no: 2,
        recipient: "Juan Dela Cruz",
        department: "IT Department",
        position: "Senior Developer",
        award_name: "Exemplary Service Award",
        category: "exemplary",
        awarding_body: "CICTMO",
        citation: "For going above and beyond in service delivery",
        date_given: "2025-11-20",
        status: "approved",
        outstanding_type: null,
        nomination_count: null,
        competition_level: null,
        date: "2025-11-20",
      },
      {
        id: 3,
        no: 3,
        recipient: "Ana Reyes",
        department: "Finance Department",
        position: "Finance Manager",
        award_name: "10 Years of Service",
        category: "service",
        awarding_body: "City Government of Tagum",
        citation: "For 10 years of dedicated service",
        date_given: "2025-10-10",
        status: "presented",
        outstanding_type: null,
        nomination_count: null,
        competition_level: null,
        date: "2025-10-10",
      },
    ]);

    const form = ref({
      recipient: "",
      department: "",
      position: "",
      date_given: "",
      award_name: "",
      category: "",
      awarding_body: "",
      citation: "",
      outstanding_type: "",
      nomination_count: "",
      competition_level: "",
      status: "pending",
    });

    const filteredRows = computed(() => {
      let result = awards.value;

      const keyword = search.value.toLowerCase().trim();
      if (keyword) {
        result = result.filter(
          (r) =>
            r.recipient?.toLowerCase().includes(keyword) ||
            r.award_name?.toLowerCase().includes(keyword) ||
            r.department?.toLowerCase().includes(keyword)
        );
      }

      if (filterCategory.value) {
        result = result.filter((r) => r.category === filterCategory.value);
      }

      return result;
    });

    function getCategoryLabel(category) {
      const labels = {
        outstanding: "Outstanding Award",
        exemplary: "Exemplary Recognition",
        service: "Service Award",
        citation: "Special Citation",
      };
      return labels[category] || category;
    }

    function getCategoryClass(category) {
      const classes = {
        outstanding: "cat-outstanding",
        exemplary: "cat-exemplary",
        service: "cat-service",
        citation: "cat-citation",
      };
      return classes[category] || "";
    }

    function statusClass(status) {
      const classes = {
        approved: "status-approved",
        pending: "status-pending",
        presented: "status-presented",
      };
      return classes[status] || "";
    }

    function clearFilters() {
      search.value = "";
      filterCategory.value = null;
    }

    function openAddAward() {
      isEditMode.value = false;
      editingId.value = null;
      form.value = {
        recipient: "",
        department: "",
        position: "",
        date_given: "",
        award_name: "",
        category: "",
        awarding_body: "",
        citation: "",
        outstanding_type: "",
        nomination_count: "",
        competition_level: "",
        status: "pending",
      };
      showFormDialog.value = true;
    }

    function editAward(row) {
      isEditMode.value = true;
      editingId.value = row.id;
      form.value = {
        recipient: row.recipient,
        department: row.department,
        position: row.position || "",
        date_given: row.date_given,
        award_name: row.award_name,
        category: row.category,
        awarding_body: row.awarding_body || "",
        citation: row.citation || "",
        outstanding_type: row.outstanding_type || "",
        nomination_count: row.nomination_count || "",
        competition_level: row.competition_level || "",
        status: row.status,
      };
      showFormDialog.value = true;
    }

    function viewAward(id) {
      $q.notify({
        type: "info",
        message: `Viewing award ID: ${id}`,
        position: "top",
      });
    }

    function confirmDeleteAward(row) {
      editingId.value = row.id;
      showDeleteDialog.value = true;
    }

    async function saveAward() {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 800));

      $q.notify({
        type: "positive",
        message: `Award ${
          isEditMode.value ? "updated" : "given"
        } successfully!`,
        position: "top",
      });

      loading.value = false;
      showFormDialog.value = false;
    }

    async function deleteAward() {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 800));

      $q.notify({
        type: "positive",
        message: "Award deleted successfully!",
        position: "top",
      });

      loading.value = false;
      showDeleteDialog.value = false;
      editingId.value = null;
    }

    return {
      search,
      filterCategory,
      loading,
      columns,
      filteredRows,
      awards,
      form,
      showFormDialog,
      showDeleteDialog,
      isEditMode,
      categoryOptions,
      outstandingTypeOptions,
      statusOptions,
      categoryFilterOptions,
      getCategoryLabel,
      getCategoryClass,
      statusClass,
      clearFilters,
      openAddAward,
      editAward,
      viewAward,
      confirmDeleteAward,
      saveAward,
      deleteAward,
    };
  },
});
</script>

<style scoped>
/* Same styles from RecognitionsPage with additional category colors */
.module-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-header h5 {
  margin: 5px 0 3px;
  color: #19354a;
  font-size: 18px;
  font-weight: 750;
}

.page-header p {
  margin: 0;
  color: #718089;
  font-size: 12px;
}

.add-event-btn {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: 12px;
  font-weight: 650;
  box-shadow: 0 4px 10px rgba(232, 145, 26, 0.25);
}

.events-card {
  overflow: hidden;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  max-width: 380px;
}

.filter-select {
  min-width: 180px;
}

.search-input :deep(.q-field__control),
.filter-select :deep(.q-field__control) {
  min-height: 38px;
  border-radius: 8px;
}

.search-input :deep(.q-field__native),
.filter-select :deep(.q-field__native) {
  font-size: 11px;
}

.search-input :deep(.q-field__prepend) {
  color: #809097;
}

.clear-btn {
  color: #6f8087;
  font-size: 10px;
}

.table-wrapper {
  padding: 0 12px;
}

.events-table {
  box-shadow: none;
}

.events-table :deep(th) {
  height: 48px;
  color: #819097;
  background: #ffffff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.events-table :deep(td) {
  height: 68px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: 11px;
}

.events-table :deep(tbody tr:hover) {
  background: #fefaf5;
}

.table-empty {
  padding: 30px 0;
  text-align: center;
  color: #8a989e;
  font-size: 12px;
}

/* Category Badges */
.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

.cat-outstanding {
  color: #d4880f;
  background: #fef6ea;
}

.cat-exemplary {
  color: #c73f8f;
  background: #fceaf5;
}

.cat-service {
  color: #0c7cb5;
  background: #e6f3fb;
}

.cat-citation {
  color: #0c9145;
  background: #e1f7e6;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

.status-approved {
  color: #0c9145;
  background: #e1f7e6;
}

.status-pending {
  color: #d4880f;
  background: #fef6ea;
}

.status-presented {
  color: #0c7cb5;
  background: #e6f3fb;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.action-view {
  color: #4b7c94;
}

.action-edit {
  color: #d4880f;
}

.action-delete {
  color: #d35d5d;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
  color: #87949a;
  font-size: 10px;
}

.table-footer strong {
  color: #405967;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.stat-icon.gold {
  background: linear-gradient(135deg, #f5a623, #e8911a);
}
.stat-icon.orange {
  background: linear-gradient(135deg, #ff7e2e, #e8691a);
}
.stat-icon.green {
  background: linear-gradient(135deg, #0fc449, #18a94d);
}

.stat-label {
  color: #687a83;
  font-size: 12px;
}

.stat-value {
  color: #14283b;
  font-size: 24px;
  font-weight: 700;
}

/* Dialog */
.event-dialog {
  border-radius: 14px;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 18px;
}

.dialog-title {
  color: #19354a;
  font-size: 16px;
  font-weight: 750;
}

.dialog-subtitle {
  margin-top: 2px;
  color: #839097;
  font-size: 10px;
}

.dialog-body {
  padding: 16px 18px;
}

.dialog-actions {
  padding: 10px 18px;
  background: #fcfdfc;
}

.cancel-btn {
  color: #718089;
  font-size: 11px;
}

.save-btn {
  min-height: 35px;
  padding: 0 16px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: 11px;
}

.delete-btn {
  min-height: 35px;
  padding: 0 16px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #e05353, #c73f3f);
  font-size: 11px;
}

.section-label {
  margin: 14px 0 8px;
  color: #8a989e;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.section-label:first-of-type {
  margin-top: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-grid .col-span-2 {
  grid-column: 1 / -1;
}

.form-grid :deep(.q-field__control) {
  border-radius: 8px;
}

.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__label) {
  font-size: 11px;
}

.dynamic-section {
  margin-top: 8px;
  padding: 12px;
  background: #fafcfa;
  border-radius: 8px;
  border-left: 3px solid #f5a623;
}

.delete-dialog {
  width: 400px;
  max-width: 92vw;
  border-radius: 14px;
}

.delete-title {
  color: #19354a;
  font-size: 15px;
  font-weight: 750;
}

.delete-message {
  margin-top: 6px;
  color: #5c6b73;
  font-size: 12px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 900px) {
  .filter-section {
    flex-wrap: wrap;
  }

  .search-input {
    max-width: none;
    width: 100%;
    flex-basis: 100%;
  }

  .filter-select {
    flex: 1;
    min-width: 150px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 650px) {
  .module-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    gap: 15px;
    flex-direction: column;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .events-table {
    min-width: 700px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
