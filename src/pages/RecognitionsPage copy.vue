<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h5>Employee Recognitions</h5>
        <p>Manage licensure exam passers and graduate studies completions.</p>
      </div>

      <q-btn
        unelevated
        no-caps
        icon="add"
        label="Add Recognition"
        class="add-event-btn"
        @click="openAddRecognition"
      />
    </section>

    <!-- =====================================================
         STATISTICS CARDS
    ====================================================== -->
    <section class="stats-grid">
      <q-card flat class="stat-card">
        <div class="stat-icon gold">
          <q-icon name="assignment" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-label">Exam Passers</div>
          <div class="stat-value">18</div>
        </div>
      </q-card>

      <q-card flat class="stat-card">
        <div class="stat-icon green">
          <q-icon name="school" size="24px" />
        </div>
        <div class="stat-info">
          <div class="stat-label">Graduate Studies</div>
          <div class="stat-value">24</div>
        </div>
      </q-card>
    </section>

    <!-- =====================================================
         RECOGNITIONS CARD
    ====================================================== -->
    <q-card flat class="events-card">
      <!-- Filters -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by employee or recognition type..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="filterType"
          outlined
          dense
          clearable
          label="Recognition Type"
          :options="typeFilterOptions"
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
          <!-- Employee / Department -->
          <template #body-cell-employee="props">
            <q-td :props="props">
              <div class="event-name">{{ props.row.employee }}</div>
              <div class="event-meta">{{ props.row.department_label }}</div>
            </q-td>
          </template>

          <!-- Type -->
          <template #body-cell-type="props">
            <q-td :props="props">
              <span class="type-badge" :class="getTypeClass(props.row.type)">
                {{ getTypeLabel(props.row.type) }}
              </span>
            </q-td>
          </template>

          <!-- Details -->
          <template #body-cell-details="props">
            <q-td :props="props">
              <div class="details-text">{{ props.row.details_summary }}</div>
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
                  @click="viewRecognition(props.row.id)"
                >
                  <q-tooltip>View</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  class="action-edit"
                  @click="editRecognition(props.row)"
                >
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  class="action-delete"
                  @click="confirmDeleteRecognition(props.row)"
                >
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="table-empty">No recognitions found.</div>
          </template>
        </q-table>
      </div>

      <!-- Footer -->
      <div class="table-footer">
        <span>
          Showing <strong>{{ filteredRows.length }}</strong> of
          <strong>{{ recognitions.length }}</strong> recognitions
        </span>
      </div>
    </q-card>

    <!-- =====================================================
         EDIT RECOGNITION DIALOG (only for editing)
    ====================================================== -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="event-dialog" style="width: 720px; max-width: 95vw">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Edit Recognition</div>
            <div class="dialog-subtitle">Update recognition details.</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <!-- Recognition Type -->
          <div class="section-label">Recognition Type</div>
          <q-select
            v-model="form.type"
            outlined
            dense
            emit-value
            map-options
            :options="recognitionTypeOptions"
            label="Select Recognition Type"
            @update:model-value="onTypeChange"
          />

          <!-- =============================================== -->
          <!-- LICENSURE EXAM FIELDS -->
          <!-- =============================================== -->
          <div v-if="form.type === 'exam'" class="dynamic-section">
            <div class="section-label">Examination Details</div>
            <div class="form-grid">
              <q-input
                v-model="form.employee"
                outlined
                dense
                label="Employee Name"
                class="col-span-2"
                hint="If multiple employees, use comma separated"
              />
              <q-input
                v-model="form.position"
                outlined
                dense
                label="Position"
              />
              <q-input
                v-model="form.employment_status"
                outlined
                dense
                label="Status of Employment"
              />
              <q-input
                v-model="form.mobile_no"
                outlined
                dense
                label="Mobile No."
              />
              <q-select
                v-model="form.department"
                outlined
                dense
                emit-value
                map-options
                :options="departmentOptions"
                label="Department / Office"
                class="col-span-2"
              />
              <q-select
                v-model="form.exam_type"
                outlined
                dense
                emit-value
                map-options
                :options="examTypeOptions"
                label="Type of Examination Passed"
                class="col-span-2"
              />
              <q-select
                v-model="form.administering_agency"
                outlined
                dense
                emit-value
                map-options
                :options="agencyOptions"
                label="Administering Agency"
              />
              <q-input
                v-model="form.exam_rating"
                outlined
                dense
                label="Examination Rating"
              />
              <q-input
                v-model="form.testing_center"
                outlined
                dense
                label="Testing Center"
              />
              <q-input
                v-model="form.exam_date"
                outlined
                dense
                label="Date of Examination"
                type="date"
              />
            </div>

            <!-- Supporting Documents -->
            <div class="section-label">Supporting Documents (Required)</div>
            <div class="form-grid">
              <q-file
                v-model="form.doc_rating"
                outlined
                dense
                label="Report of Rating"
                accept=".pdf,.jpg,.png"
                class="col-span-2"
              >
                <template #prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <q-file
                v-model="form.doc_photo"
                outlined
                dense
                label="Recent Photo"
                accept=".jpg,.png"
                class="col-span-2"
              >
                <template #prepend>
                  <q-icon name="photo" />
                </template>
              </q-file>
              <q-file
                v-model="form.doc_screenshot"
                outlined
                dense
                label="Screenshot from CSC/PRC Website of Passer"
                accept=".jpg,.png,.pdf"
                class="col-span-2"
              >
                <template #prepend>
                  <q-icon name="screenshot" />
                </template>
              </q-file>
            </div>
          </div>

          <!-- =============================================== -->
          <!-- GRADUATE STUDIES FIELDS -->
          <!-- =============================================== -->
          <div v-if="form.type === 'graduate_studies'" class="dynamic-section">
            <div class="section-label">Graduate Studies Details</div>
            <div class="form-grid">
              <q-input
                v-model="form.employee"
                outlined
                dense
                label="Employee Name"
                class="col-span-2"
              />
              <q-input
                v-model="form.position"
                outlined
                dense
                label="Position"
              />
              <q-input
                v-model="form.mobile_no"
                outlined
                dense
                label="Mobile No."
              />
              <q-select
                v-model="form.department"
                outlined
                dense
                emit-value
                map-options
                :options="departmentOptions"
                label="Department / Office"
                class="col-span-2"
              />
              <q-input
                v-model="form.degree_completed"
                outlined
                dense
                label="Degree Completed"
                class="col-span-2"
                hint="e.g. Master of Public Administration"
              />
              <q-input
                v-model="form.major_specialization"
                outlined
                dense
                label="Major / Specialization"
                class="col-span-2"
              />
              <q-input
                v-model="form.university"
                outlined
                dense
                label="Name of College / University"
                class="col-span-2"
              />
              <q-input
                v-model="form.graduation_date"
                outlined
                dense
                label="Date of Completion / Graduation"
                type="date"
              />
              <q-select
                v-model="form.learning_mode"
                outlined
                dense
                emit-value
                map-options
                :options="learningModeOptions"
                label="Mode of Learning"
              />
            </div>

            <!-- Supporting Documents -->
            <div class="section-label">Supporting Documents</div>
            <div class="form-grid">
              <q-file
                v-model="form.doc_certificate"
                outlined
                dense
                label="Certificate of Graduation/Completion"
                accept=".pdf,.jpg,.png"
                class="col-span-2"
              >
                <template #prepend>
                  <q-icon name="description" />
                </template>
              </q-file>
              <q-file
                v-model="form.doc_yearbook"
                outlined
                dense
                label="Graduation/Yearbook Photo (if any)"
                accept=".jpg,.png"
                class="col-span-2"
              >
                <template #prepend>
                  <q-icon name="photo_library" />
                </template>
              </q-file>
              <q-file
                v-model="form.doc_diploma"
                outlined
                dense
                label="Diploma and/or TOR"
                accept=".pdf,.jpg,.png"
                class="col-span-2"
              >
                <template #prepend>
                  <q-icon name="school" />
                </template>
              </q-file>
            </div>
          </div>

          <!-- Common Status -->
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

          <!-- Remarks (Optional) -->
          <div class="section-label">Remarks (Optional)</div>
          <q-input
            v-model="form.remarks"
            outlined
            dense
            label="Remarks"
            type="textarea"
            rows="2"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Save Changes"
            class="save-btn"
            :loading="loading"
            @click="saveRecognition"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         DELETE CONFIRMATION DIALOG
    ====================================================== -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card class="delete-dialog">
        <q-card-section class="dialog-body">
          <div class="delete-title">Delete Recognition</div>
          <div class="delete-message">
            Are you sure you want to delete this recognition? This action cannot
            be undone.
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
            @click="deleteRecognition"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "RecognitionsPage",

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const search = ref("");
    const filterType = ref(null);
    const loading = ref(false);
    const showFormDialog = ref(false);
    const showDeleteDialog = ref(false);
    const isEditMode = ref(false);
    const editingId = ref(null);

    // ---------- Options (unchanged) ----------
    const recognitionTypeOptions = [
      { label: "Licensure Examination Passer", value: "exam" },
      { label: "Completion of Graduate Studies", value: "graduate_studies" },
    ];

    const typeFilterOptions = [
      { label: "Licensure Exam", value: "exam" },
      { label: "Graduate Studies", value: "graduate_studies" },
    ];

    const departmentOptions = [
      { label: "Human Resource Department", value: "hr" },
      { label: "Information Technology", value: "it" },
      { label: "Finance", value: "finance" },
      { label: "Operations", value: "operations" },
      { label: "Administration", value: "admin" },
      { label: "Office of the Mayor", value: "mayor" },
      { label: "City Planning", value: "planning" },
      { label: "Social Welfare", value: "sw" },
      { label: "Engineering", value: "engineering" },
    ];

    const examTypeOptions = [
      { label: "Civil Service Examination - Professional", value: "csc_prof" },
      {
        label: "Civil Service Examination - Subprofessional",
        value: "csc_subprof",
      },
      { label: "Civil Service Examination - Barangay", value: "csc_barangay" },
      { label: "PRC - Licensure Exam for Teachers (LET)", value: "prc_let" },
      { label: "PRC - Nurse Licensure Exam (NLE)", value: "prc_nle" },
      { label: "PRC - Civil Engineer Licensure Exam", value: "prc_ce" },
      { label: "PRC - Accountancy Licensure Exam", value: "prc_cpa" },
      { label: "PRC - Architect Licensure Exam", value: "prc_arch" },
      { label: "PRC - Other Professional Exam", value: "prc_other" },
    ];

    const agencyOptions = [
      { label: "Civil Service Commission (CSC)", value: "csc" },
      { label: "Professional Regulation Commission (PRC)", value: "prc" },
    ];

    const learningModeOptions = [
      { label: "Face-to-Face (F2F)", value: "f2f" },
      { label: "Online", value: "online" },
      { label: "Distance Learning", value: "distance" },
      { label: "Hybrid", value: "hybrid" },
    ];

    const statusOptions = [
      { label: "Pending", value: "pending" },
      { label: "Approved", value: "approved" },
      { label: "Verified", value: "verified" },
      { label: "Rejected", value: "rejected" },
    ];

    // ---------- Columns ----------
    const columns = [
      { name: "no", label: "NO.", field: "no", align: "left" },
      {
        name: "employee",
        label: "EMPLOYEE",
        field: "employee",
        align: "left",
        sortable: true,
      },
      { name: "type", label: "TYPE", field: "type", align: "left" },
      {
        name: "details",
        label: "DETAILS",
        field: "details_summary",
        align: "left",
      },
      { name: "date", label: "DATE", field: "event_date", align: "left" },
      { name: "status", label: "STATUS", field: "status", align: "left" },
      { name: "actions", label: "", field: "actions", align: "right" },
    ];

    // ---------- Sample Data ----------
    const recognitions = ref([
      {
        id: 1,
        no: 1,
        employee: "Maria Santos, John Doe",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Specialist",
        type: "exam",
        exam_type: "csc_prof",
        exam_type_label: "CSC - Professional",
        administering_agency: "csc",
        exam_rating: "92.5%",
        testing_center: "Manila",
        exam_date: "2025-06-15",
        employment_status: "Permanent",
        mobile_no: "09171234567",
        status: "approved",
        remarks: "",
        details_summary: "CSC Professional (92.5%) - 2025",
        event_date: "2025-06-15",
        doc_rating: null,
        doc_photo: null,
        doc_screenshot: null,
      },
      {
        id: 2,
        no: 2,
        employee: "Ana Reyes",
        department: "finance",
        department_label: "Finance",
        position: "Finance Manager",
        type: "graduate_studies",
        degree_completed: "Master of Public Administration",
        major_specialization: "Public Policy",
        university: "University of the Philippines Diliman",
        graduation_date: "2025-05-30",
        learning_mode: "f2f",
        learning_mode_label: "Face-to-Face",
        mobile_no: "09179876543",
        status: "pending",
        remarks: "",
        details_summary: "MPA - UP Diliman (2025)",
        event_date: "2025-05-30",
        doc_certificate: null,
        doc_yearbook: null,
        doc_diploma: null,
      },
    ]);

    // ---------- Form (for editing) ----------
    const form = ref({
      type: null,
      employee: "",
      position: "",
      mobile_no: "",
      department: "",
      status: "pending",
      remarks: "",
      employment_status: "",
      exam_type: "",
      administering_agency: "",
      exam_rating: "",
      testing_center: "",
      exam_date: "",
      doc_rating: null,
      doc_photo: null,
      doc_screenshot: null,
      degree_completed: "",
      major_specialization: "",
      university: "",
      graduation_date: "",
      learning_mode: "",
      doc_certificate: null,
      doc_yearbook: null,
      doc_diploma: null,
    });

    // ---------- Computed ----------
    const filteredRows = computed(() => {
      let result = recognitions.value;
      const keyword = search.value.toLowerCase().trim();
      if (keyword) {
        result = result.filter(
          (r) =>
            r.employee?.toLowerCase().includes(keyword) ||
            r.department_label?.toLowerCase().includes(keyword) ||
            r.details_summary?.toLowerCase().includes(keyword)
        );
      }
      if (filterType.value) {
        result = result.filter((r) => r.type === filterType.value);
      }
      return result;
    });

    // ---------- Helper Functions ----------
    function getTypeLabel(type) {
      const labels = {
        exam: "Licensure Exam",
        graduate_studies: "Graduate Studies",
      };
      return labels[type] || type;
    }

    function getTypeClass(type) {
      const classes = {
        exam: "type-exam",
        graduate_studies: "type-graduate",
      };
      return classes[type] || "";
    }

    function statusClass(status) {
      const classes = {
        approved: "status-approved",
        pending: "status-pending",
        verified: "status-verified",
        rejected: "status-rejected",
      };
      return classes[status] || "";
    }

    function onTypeChange() {
      // Reset type-specific fields
      form.value.employment_status = "";
      form.value.exam_type = "";
      form.value.administering_agency = "";
      form.value.exam_rating = "";
      form.value.testing_center = "";
      form.value.exam_date = "";
      form.value.doc_rating = null;
      form.value.doc_photo = null;
      form.value.doc_screenshot = null;
      form.value.degree_completed = "";
      form.value.major_specialization = "";
      form.value.university = "";
      form.value.graduation_date = "";
      form.value.learning_mode = "";
      form.value.doc_certificate = null;
      form.value.doc_yearbook = null;
      form.value.doc_diploma = null;
    }

    function clearFilters() {
      search.value = "";
      filterType.value = null;
    }

    // ---------- CRUD Operations ----------
    // ✅ FIX: Use router to navigate to create page
    function openAddRecognition() {
      router.push({ name: "create_recognition" });
    }

    function editRecognition(row) {
      isEditMode.value = true;
      editingId.value = row.id;
      form.value = {
        type: row.type,
        employee: row.employee,
        position: row.position || "",
        mobile_no: row.mobile_no || "",
        department: row.department || "",
        status: row.status,
        remarks: row.remarks || "",
        employment_status: row.employment_status || "",
        exam_type: row.exam_type || "",
        administering_agency: row.administering_agency || "",
        exam_rating: row.exam_rating || "",
        testing_center: row.testing_center || "",
        exam_date: row.exam_date || "",
        doc_rating: null,
        doc_photo: null,
        doc_screenshot: null,
        degree_completed: row.degree_completed || "",
        major_specialization: row.major_specialization || "",
        university: row.university || "",
        graduation_date: row.graduation_date || "",
        learning_mode: row.learning_mode || "",
        doc_certificate: null,
        doc_yearbook: null,
        doc_diploma: null,
      };
      showFormDialog.value = true;
    }

    function viewRecognition(id) {
      // Optional – you can add a view page later
      $q.notify({
        type: "info",
        message: `Viewing recognition ID: ${id}`,
        position: "top",
      });
      // Or router.push({ name: 'view_recognition', params: { id } });
    }

    function confirmDeleteRecognition(row) {
      editingId.value = row.id;
      showDeleteDialog.value = true;
    }

    async function saveRecognition() {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 800));

      const entry = {
        id: isEditMode.value ? editingId.value : recognitions.value.length + 1,
        no: isEditMode.value ? editingId.value : recognitions.value.length + 1,
        employee: form.value.employee,
        department: form.value.department,
        department_label:
          departmentOptions.find((d) => d.value === form.value.department)
            ?.label || "",
        position: form.value.position,
        mobile_no: form.value.mobile_no,
        type: form.value.type,
        status: form.value.status,
        remarks: form.value.remarks,
        employment_status: form.value.employment_status,
        exam_type: form.value.exam_type,
        exam_type_label:
          examTypeOptions.find((e) => e.value === form.value.exam_type)
            ?.label || "",
        administering_agency: form.value.administering_agency,
        exam_rating: form.value.exam_rating,
        testing_center: form.value.testing_center,
        exam_date: form.value.exam_date,
        degree_completed: form.value.degree_completed,
        major_specialization: form.value.major_specialization,
        university: form.value.university,
        graduation_date: form.value.graduation_date,
        learning_mode: form.value.learning_mode,
        learning_mode_label:
          learningModeOptions.find((l) => l.value === form.value.learning_mode)
            ?.label || "",
        details_summary:
          form.value.type === "exam"
            ? `${form.value.exam_type_label || form.value.exam_type} (${
                form.value.exam_rating
              }) - ${form.value.exam_date}`
            : `${form.value.degree_completed} - ${form.value.university} (${form.value.graduation_date})`,
        event_date:
          form.value.type === "exam"
            ? form.value.exam_date
            : form.value.graduation_date,
        doc_rating: form.value.doc_rating ? form.value.doc_rating.name : null,
        doc_photo: form.value.doc_photo ? form.value.doc_photo.name : null,
        doc_screenshot: form.value.doc_screenshot
          ? form.value.doc_screenshot.name
          : null,
        doc_certificate: form.value.doc_certificate
          ? form.value.doc_certificate.name
          : null,
        doc_yearbook: form.value.doc_yearbook
          ? form.value.doc_yearbook.name
          : null,
        doc_diploma: form.value.doc_diploma
          ? form.value.doc_diploma.name
          : null,
      };

      if (isEditMode.value) {
        const index = recognitions.value.findIndex(
          (r) => r.id === editingId.value
        );
        if (index !== -1) {
          recognitions.value[index] = {
            ...recognitions.value[index],
            ...entry,
          };
        }
      } else {
        recognitions.value.push(entry);
      }

      $q.notify({
        type: "positive",
        message: `Recognition ${
          isEditMode.value ? "updated" : "added"
        } successfully!`,
        position: "top",
      });

      loading.value = false;
      showFormDialog.value = false;
    }

    async function deleteRecognition() {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 800));
      const index = recognitions.value.findIndex(
        (r) => r.id === editingId.value
      );
      if (index !== -1) {
        recognitions.value.splice(index, 1);
      }
      $q.notify({
        type: "positive",
        message: "Recognition deleted successfully!",
        position: "top",
      });
      loading.value = false;
      showDeleteDialog.value = false;
      editingId.value = null;
    }

    return {
      search,
      filterType,
      loading,
      columns,
      filteredRows,
      recognitions,
      form,
      showFormDialog,
      showDeleteDialog,
      isEditMode,
      recognitionTypeOptions,
      typeFilterOptions,
      departmentOptions,
      examTypeOptions,
      agencyOptions,
      learningModeOptions,
      statusOptions,
      getTypeLabel,
      getTypeClass,
      statusClass,
      onTypeChange,
      clearFilters,
      openAddRecognition,
      editRecognition,
      viewRecognition,
      confirmDeleteRecognition,
      saveRecognition,
      deleteRecognition,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   MODULE PAGE
========================================================= */
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.event-name {
  color: #19354a;
  font-size: 11px;
  font-weight: 700;
}

.event-meta {
  margin-top: 3px;
  color: #8a989e;
  font-size: 9px;
}

.details-text {
  font-size: 11px;
  color: #425b68;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

.type-exam {
  color: #0c7cb5;
  background: #e6f3fb;
}
.type-graduate {
  color: #d4880f;
  background: #fef6ea;
}

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
.status-verified {
  color: #0c7cb5;
  background: #e6f3fb;
}
.status-rejected {
  color: #c73f3f;
  background: #fbe9e9;
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
  max-height: 70vh;
  overflow-y: auto;
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
